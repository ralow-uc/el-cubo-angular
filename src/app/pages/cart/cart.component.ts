import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { formatCLP, imageUrl } from '../../services/storage.util';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.component.html',
})
export class CartComponent {
  private cart = inject(CartService);

  readonly lines = this.cart.lines;
  readonly total = this.cart.total;
  readonly count = this.cart.count;
  readonly formatCLP = formatCLP;
  readonly imageUrl = imageUrl;

  inc(productId: string, current: number): void {
    this.cart.setQty(productId, current + 1);
  }
  dec(productId: string, current: number): void {
    this.cart.setQty(productId, current - 1);
  }
  remove(productId: string): void {
    this.cart.remove(productId);
  }
  updateQty(productId: string, value: string | number): void {
    const v = Math.max(0, parseInt(String(value), 10) || 0);
    this.cart.setQty(productId, v);
  }
  clearAll(): void {
    if (confirm('¿Vaciar todo el carrito?')) this.cart.clear();
  }
}
