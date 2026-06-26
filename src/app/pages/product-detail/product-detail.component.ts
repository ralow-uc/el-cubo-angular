import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { CATEGORY_LABELS } from '../../data/seed';
import { formatCLP, imageUrl } from '../../services/storage.util';

/**
 * Ficha individual de un producto. Lee el `:id` de la URL, busca el
 * producto en `ProductService.byId()` y muestra su detalle (precio,
 * stock, descripción) con la opción de agregar al carrito.
 *
 * Demuestra el paso de datos entre componentes vía parámetros de ruta.
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private products = inject(ProductService);
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private toast = inject(ToastService);

  private params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly product = computed(() =>
    this.products.byId(this.params().get('id') ?? '')
  );

  readonly categoryTitle = computed(
    () => CATEGORY_LABELS[this.product()?.category ?? '']?.title ?? ''
  );

  readonly formatCLP = formatCLP;
  readonly imageUrl = imageUrl;

  get isAdmin(): boolean {
    return this.auth.currentUser()?.role === 'admin';
  }

  add(): void {
    const p = this.product();
    if (!p) return;
    if (!this.auth.session()) {
      this.toast.show('Debes iniciar sesión para comprar.', 'error');
      setTimeout(() => this.router.navigate(['/login']), 900);
      return;
    }
    try {
      this.cart.add(p.id, 1);
      this.toast.show(`✓ ${p.name} agregado al carrito`);
    } catch (err) {
      this.toast.show((err as Error).message, 'error');
    }
  }
}
