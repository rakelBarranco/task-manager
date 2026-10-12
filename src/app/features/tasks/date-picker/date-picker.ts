import { Component, signal, computed, forwardRef, HostListener, ElementRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-angular';

interface DayCell { date: string; day: number; inMonth: boolean; isToday: boolean; }

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './date-picker.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePicker),
    multi: true,
  }],
})
export class DatePicker implements ControlValueAccessor {
  private host = inject(ElementRef);

  readonly CalendarDays = CalendarDays;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly X = X;

  readonly weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  readonly monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  value = signal<string | null>(null);
  open = signal(false);
  disabled = signal(false);
  cursor = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  private onChange: (v: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor ---
  writeValue(v: string | null): void {
    this.value.set(v || null);
    if (v) {
      const [y, m] = v.split('-').map(Number);
      this.cursor.set(new Date(y, m - 1, 1));
    }
  }
  registerOnChange(fn: (v: string | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  label = computed(() => {
    const v = this.value();
    if (!v) return 'Sin fecha';
    const [y, m, d] = v.split('-');
    return `${d}/${m}/${y}`;
  });

  monthLabel = computed(() => {
    const d = this.cursor();
    return `${this.monthNames[d.getMonth()]} ${d.getFullYear()}`;
  });

  cells = computed<DayCell[]>(() => {
    const d = this.cursor();
    const year = d.getFullYear();
    const month = d.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startOffset);
    const todayStr = this.toStr(new Date());
    const result: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const date = this.toStr(cur);
      result.push({ date, day: cur.getDate(), inMonth: cur.getMonth() === month, isToday: date === todayStr });
    }
    return result;
  });

  toggle() {
    if (this.disabled()) return;
    this.open.update(o => !o);
  }

  select(cell: DayCell) {
    this.value.set(cell.date);
    this.onChange(cell.date);
    this.onTouched();
    this.open.set(false);
  }

  clear(event: Event) {
    event.stopPropagation();
    this.value.set(null);
    this.onChange(null);
    this.open.set(false);
  }

  prevMonth() { const d = this.cursor(); this.cursor.set(new Date(d.getFullYear(), d.getMonth() - 1, 1)); }
  nextMonth() { const d = this.cursor(); this.cursor.set(new Date(d.getFullYear(), d.getMonth() + 1, 1)); }

  isSelected(date: string): boolean { return this.value() === date; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(e.target)) {
      this.open.set(false);
    }
  }

  private toStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
