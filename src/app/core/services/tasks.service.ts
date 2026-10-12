import { Injectable, inject, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import {Task, NewTask, TaskStatus} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private supabase = inject(SupabaseService).client;
  private auth = inject(AuthService);

  tasks = signal<Task[]>([]);
  loading = signal(false);

  async load() {
    this.loading.set(true);
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    this.loading.set(false);

    if (!error && data) {
      this.tasks.set(data as Task[]);
    }
  }

  async add(task: NewTask) {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    const { data, error } = await this.supabase
      .from('tasks')
      .insert({ ...task, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    if (data) {
      this.tasks.update(list => [data as Task, ...list]);
    }
  }

  async update(id: string, changes: Partial<Task>) {
    const previous = this.tasks();
    this.tasks.update(list =>
      list.map(t => (t.id === id ? { ...t, ...changes } as Task : t))
    );

    const { error } = await this.supabase
      .from('tasks')
      .update(changes)
      .eq('id', id);

    if (error) {
      this.tasks.set(previous);
    }
  }

  async toggle(task: Task) {
    const completed = !task.completed;
    const status: TaskStatus = completed ? 'done' : 'todo';
    const prev = this.tasks();
    this.tasks.update(list =>
      list.map(t => (t.id === task.id ? { ...t, completed, status } : t))
    );
    const { error } = await this.supabase
      .from('tasks')
      .update({ completed, status })
      .eq('id', task.id);
    if (error) this.tasks.set(prev);
    return { error };
  }

  async remove(id: string) {
    const previous = this.tasks();
    this.tasks.update(list => list.filter(t => t.id !== id));

    const { error } = await this.supabase.from('tasks').delete().eq('id', id);

    if (error) {
      this.tasks.set(previous);
    }
  }

  subscribeRealtime(): RealtimeChannel {
    return this.supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => this.load()
      )
      .subscribe();
  }

  async setStatus(task: Task, status: TaskStatus) {
    const completed = status === 'done';
    const prev = this.tasks();
    this.tasks.update(list =>
      list.map(t => (t.id === task.id ? { ...t, status, completed } : t))
    );
    const { error } = await this.supabase
      .from('tasks')
      .update({ status, completed })
      .eq('id', task.id);
    if (error) this.tasks.set(prev);
    return { error };
  }

  async setDueDate(task: Task, due_date: string | null) {
    const prev = this.tasks();
    this.tasks.update(list =>
      list.map(t => (t.id === task.id ? { ...t, due_date } : t))
    );
    const { error } = await this.supabase
      .from('tasks')
      .update({ due_date })
      .eq('id', task.id);
    if (error) this.tasks.set(prev);
    return { error };
  }
}
