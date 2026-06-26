import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  variant: 'success' | 'error';
}

/**
 * Servicio de notificaciones efímeras (toasts).
 *
 * Cualquier componente puede llamar `show()` para empujar un mensaje en la
 * UI. El `ToastComponent` global los renderiza y cada uno se auto-remueve
 * a los ~2.6 segundos.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  /** Lista reactiva de toasts visibles en este momento. */
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  /** Muestra un toast por ~2.6s. `variant` controla el color (verde/rojo). */
  show(message: string, variant: Toast['variant'] = 'success'): void {
    const id = this.nextId++;
    this.toasts.set([...this.toasts(), { id, message, variant }]);
    setTimeout(() => {
      this.toasts.set(this.toasts().filter((t) => t.id !== id));
    }, 2600);
  }
}
