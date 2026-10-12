import { Component, inject } from '@angular/core';
import { LucideAngularModule, CheckCircle2, XCircle, Info, X } from 'lucide-angular';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './toast.html',
})
export class Toast {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;

  readonly icons = { success: CheckCircle2, error: XCircle, info: Info };
  readonly closeIcon = X;

  dismiss(id: number) { this.toastService.dismiss(id); }
}
