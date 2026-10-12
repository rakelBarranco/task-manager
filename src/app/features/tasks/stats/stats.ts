import { Component, inject, computed } from '@angular/core';
import { TasksService } from '../../../core/services/tasks.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  templateUrl: './stats.html',
})
export class Stats {
  private tasksService = inject(TasksService);
  tasks = this.tasksService.tasks;

  total = computed(() => this.tasks().length);
  completed = computed(() => this.tasks().filter(t => t.completed).length);
  pending = computed(() => this.total() - this.completed());
  percent = computed(() => this.total() ? Math.round((this.completed() / this.total()) * 100) : 0);

  byStatus = computed(() => {
    const t = this.tasks();
    return {
      todo: t.filter(x => (x.status ?? 'todo') === 'todo').length,
      doing: t.filter(x => x.status === 'doing').length,
      done: t.filter(x => x.status === 'done').length,
    };
  });

  // Donut de prioridades (segmentos SVG)
  donut = computed(() => {
    const t = this.tasks();
    const counts = {
      high: t.filter(x => x.priority === 'high').length,
      medium: t.filter(x => x.priority === 'medium').length,
      low: t.filter(x => x.priority === 'low').length,
    };
    const total = counts.high + counts.medium + counts.low;
    const colors = { high: '#e2504a', medium: '#c98a12', low: '#1f9c66' };
    const order = [
      { key: 'high' as const, label: 'Alta' },
      { key: 'medium' as const, label: 'Media' },
      { key: 'low' as const, label: 'Baja' },
    ];
    const C = 2 * Math.PI * 42; // circunferencia (radio 42)
    let acc = 0;
    const segs = order.map(o => {
      const value = counts[o.key];
      const len = total ? (value / total) * C : 0;
      const seg = {
        label: o.label,
        value,
        color: colors[o.key],
        dash: `${len} ${C - len}`,
        offset: -acc,
      };
      acc += len;
      return seg;
    });
    return { segs, total };
  });

  pct(value: number): number {
    return this.total() ? (value / this.total()) * 100 : 0;
  }
}
