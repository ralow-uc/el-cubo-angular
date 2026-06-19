import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @for (t of toasts.toasts(); track t.id) {
      <div class="cart-toast is-visible"
           [class.cart-toast--error]="t.variant === 'error'">
        {{ t.message }}
      </div>
    }
  `,
})
export class ToastComponent {
  toasts = inject(ToastService);
}
