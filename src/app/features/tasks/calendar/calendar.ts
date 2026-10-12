import { Component, inject, signal, computed, output } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { LucideAngularModule, ChevronLeft, ChevronRight, Plus } from 'lucide-angular';
import { TasksService } from '../../../core/services/tasks.service';
import { Task, Priority } from '../../../core/models/task.model';

interface DayCell {
  date: string;     // yyyy-mm-dd
  day: number;
  inMonth: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [DragDropModule, LucideAngularModule],
  templateUrl: './calendar.html',
})
export class Calendar {
  private tasksService = inject(TasksService);
  tasks = this.tasksService.tasks;
  addOnDay = output<string>();

  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Plus = Plus;


  readonly weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // primer día del mes mostrado
  cursor = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  monthLabel = computed(() => {
    const d = this.cursor();
    return `${this.monthNames[d.getMonth()]} ${d.getFullYear()}`;
  });

  cells = computed<DayCell[]>(() => {
    const d = this.cursor();
    const year = d.getFullYear();
    const month = d.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // lunes = 0
    const start = new Date(year, month, 1 - startOffset);
    const todayStr = this.toStr(new Date());
    const result: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const date = this.toStr(cur);
      result.push({
        date,
        day: cur.getDate(),
        inMonth: cur.getMonth() === month,
        isToday: date === todayStr,
      });
    }
    return result;
  });

  dayListIds = computed(() => this.cells().map(c => c.date));

  tasksForDay(date: string): Task[] {
    return this.tasks().filter(t => t.due_date === date);
  }

  async drop(event: CdkDragDrop<Task[]>, date: string) {
    const task = event.item.data as Task;
    if (task.due_date === date) return;
    await this.tasksService.setDueDate(task, date);
  }

  prevMonth() {
    const d = this.cursor();
    this.cursor.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  nextMonth() {
    const d = this.cursor();
    this.cursor.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }
  goToday() {
    const n = new Date();
    this.cursor.set(new Date(n.getFullYear(), n.getMonth(), 1));
  }

  priorityDot(p: Priority): string {
    return p === 'high' ? '#e2504a' : p === 'medium' ? '#c98a12' : '#1f9c66';
  }

  private toStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
