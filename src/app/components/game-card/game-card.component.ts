import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { formatCLP, imageUrl } from '../../services/storage.util';

/**
 * Card reutilizable que muestra un producto con su imagen, precio,
 * descripción y botón "Agregar al carrito".
 *
 * Recibe el producto por `@Input` (paso de datos entre componentes) y
 * dispara el agregado al carrito vía `CartService` cuando corresponde.
 */
@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './game-card.component.html',
})
export class GameCardComponent {
  /** Producto que se renderiza en la card. */
  @Input({ required: true }) product!: Product;

  private auth = inject(AuthService);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly formatCLP = formatCLP;
  readonly imageUrl = imageUrl;

  isAdmin(): boolean {
    return this.auth.currentUser()?.role === 'admin';
  }

  add(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.auth.session()) {
      this.toast.show('Debes iniciar sesión para comprar.', 'error');
      setTimeout(() => this.router.navigate(['/login']), 900);
      return;
    }
    try {
      this.cart.add(this.product.id, 1);
      this.toast.show(`✓ ${this.product.name} agregado al carrito`);
    } catch (err) {
      this.toast.show((err as Error).message, 'error');
    }
  }
}
