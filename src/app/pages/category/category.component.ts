import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../services/product.service';
import { CATEGORY_LABELS } from '../../data/seed';
import { GameCardComponent } from '../../components/game-card/game-card.component';

/**
 * Página única para todas las categorías. Lee el `:slug` de la URL,
 * filtra el catálogo en `ProductService.byCategory()` y muestra los
 * juegos correspondientes. Reemplaza las 4 vistas HTML estáticas
 * originales con una sola componente reutilizable.
 */
@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterLink, GameCardComponent],
  templateUrl: './category.component.html',
})
export class CategoryComponent {
  private products = inject(ProductService);
  private route = inject(ActivatedRoute);

  private params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly slug = computed(() => this.params().get('slug') ?? '');

  readonly meta = computed(
    () =>
      CATEGORY_LABELS[this.slug()] ?? {
        title: this.slug(),
        eyebrow: 'Categoría',
        lead: '',
      }
  );

  readonly games = computed(() => this.products.byCategory(this.slug()));
}
