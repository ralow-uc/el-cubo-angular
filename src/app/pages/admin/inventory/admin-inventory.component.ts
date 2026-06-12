import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { imageUrl } from '../../../services/storage.util';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-inventory.component.html',
})
export class AdminInventoryComponent {
  private products = inject(ProductService);

  readonly list = this.products.products;
  readonly imageUrl = imageUrl;

  stockState(p: Product): { label: string; cls: string } {
    if (p.stock === 0) return { label: 'Agotado', cls: 'stock-out' };
    if (p.stock <= 3) return { label: 'Stock bajo', cls: 'stock-low' };
    return { label: 'OK', cls: 'stock-ok' };
  }

  inc(p: Product): void {
    this.products.update(p.id, { stock: p.stock + 1 });
  }
  dec(p: Product): void {
    this.products.update(p.id, { stock: Math.max(0, p.stock - 1) });
  }
  setStock(p: Product, value: string | number): void {
    const v = Math.max(0, parseInt(String(value), 10) || 0);
    this.products.update(p.id, { stock: v });
  }
}
