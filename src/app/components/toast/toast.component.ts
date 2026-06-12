import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngFor="let t of toasts.toasts()"
         class="cart-toast is-visible"
         [class.cart-toast--error]="t.variant === 'error'">
      {{ t.message }}
    </div>
  `,
})
export class ToastComponent {
  toasts = inject(ToastService);
}
