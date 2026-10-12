import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  LucideAngularModule,
  Sun, Moon, LogOut, Plus, Search, Pencil, Trash2, Check, CalendarDays
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { TasksService } from '../../core/services/tasks.service';
import { ThemeService } from '../../core/services/theme.service';
import { Task, Priority } from '../../core/models/task.model';

type Filter = 'all' | 'pending' | 'completed';

@Component({
  selector: 'app-tasks',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export default class Tasks implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);
  private auth = inject(AuthService);
  private router = inject(Router);
  theme = inject(ThemeService);

  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly LogOut = LogOut;
  readonly Plus = Plus;
  readonly Search = Search;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly Check = Check;
  readonly CalendarDays = CalendarDays;

  private channel?: RealtimeChannel;

  user = this.auth.user;
  tasks = this.tasksService.tasks;
  loading = this.tasksService.loading;

  filter = signal<Filter>('all');
  search = signal('');
  editingId = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    priority: ['medium' as Priority, Validators.required],
    due_date: ['']
  });

  get currentPriority(): Priority {
    return this.form.controls.priority.value as Priority;
  }

  visibleTasks = computed(() => {
    const term = this.search().trim().toLowerCase();
    const f = this.filter();
    return this.tasks().filter(t => {
      const matchesFilter =
        f === 'all' ? true : f === 'pending' ? !t.completed : t.completed;
      const matchesSearch =
        !term ||
        t.title.toLowerCase().includes(term) ||
        (t.description?.toLowerCase().includes(term) ?? false);
      return matchesFilter && matchesSearch;
    });
  });

  pendingCount = computed(() => this.tasks().filter(t => !t.completed).length);
  completedCount = computed(() => this.tasks().filter(t => t.completed).length);

  async ngOnInit() {
    await this.tasksService.load();
    this.channel = this.tasksService.subscribeRealtime();
  }

  ngOnDestroy() {
    this.channel?.unsubscribe();
  }

  setPriority(p: Priority) {
    this.form.patchValue({ priority: p });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, priority, due_date } = this.form.getRawValue();
    const payload = {
      title: title!.trim(),
      description: description?.trim() || null,
      priority: priority as Priority,
      due_date: due_date || null
    };

    const id = this.editingId();
    if (id) {
      await this.tasksService.update(id, payload);
      this.editingId.set(null);
    } else {
      await this.tasksService.add(payload);
    }

    this.form.reset({ priority: 'medium' });
  }

  startEdit(task: Task) {
    this.editingId.set(task.id);
    this.form.patchValue({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      due_date: task.due_date ?? ''
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.form.reset({ priority: 'medium' });
  }

  async toggle(task: Task) {
    await this.tasksService.toggle(task);
  }

  async remove(id: string) {
    await this.tasksService.remove(id);
  }

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }

  isOverdue(task: Task): boolean {
    if (!task.due_date || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.due_date) < today;
  }

  priorityLabel(p: Priority): string {
    return p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta';
  }

  priorityBg(p: Priority): string {
    return p === 'high' ? 'rgba(226,80,74,0.14)'
      : p === 'medium' ? 'rgba(201,138,18,0.16)'
        : 'rgba(31,156,102,0.16)';
  }

  priorityText(p: Priority): string {
    return p === 'high' ? '#e2504a' : p === 'medium' ? '#c98a12' : '#1f9c66';
  }

  formatDate(d: string): string {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }
}
