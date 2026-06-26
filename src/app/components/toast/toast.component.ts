import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

/**
 * Contenedor global de toasts. Renderiza los toasts emitidos por
 * `ToastService` y los anima con el CSS `.cart-toast.is-visible`.
 */
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
