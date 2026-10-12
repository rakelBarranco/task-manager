import { Component, inject, output } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { LucideAngularModule, CalendarDays, Pencil, Trash2 } from 'lucide-angular';
import { TasksService } from '../../../core/services/tasks.service';
import { Task, Priority, TaskStatus } from '../../../core/models/task.model';

interface Column { id: TaskStatus; title: string; }

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [DragDropModule, LucideAngularModule],
  templateUrl: './board.html',
})
export class Board {
  private tasksService = inject(TasksService);
  tasks = this.tasksService.tasks;

  editTask = output<Task>();
  deleteTask = output<Task>();

  readonly CalendarDays = CalendarDays;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  readonly columns: Column[] = [
    { id: 'todo',  title: 'Por hacer' },
    { id: 'doing', title: 'En progreso' },
    { id: 'done',  title: 'Hecho' },
  ];

  readonly dropListIds = ['todo', 'doing', 'done'];

  tasksByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter(t => (t.status ?? 'todo') === status);
  }

  async drop(event: CdkDragDrop<Task[]>, status: TaskStatus) {
    if (event.previousContainer === event.container) return;
    const task = event.item.data as Task;
    await this.tasksService.setStatus(task, status);
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
