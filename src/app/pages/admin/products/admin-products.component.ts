import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { formatCLP, imageUrl } from '../../../services/storage.util';

interface ProductForm {
  id: string;
  name: string;
  category: 'estrategia' | 'familiares' | 'cartas' | 'cooperativos';
  description: string;
  price: number | null;
  oldPrice: number | null;
  stock: number | null;
  players: string;
  image: string;
  onSale: boolean;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
})
export class AdminProductsComponent {
  private productService = inject(ProductService);

  readonly products = this.productService.products;
  readonly formatCLP = formatCLP;
  readonly imageUrl = imageUrl;

  open = signal(false);
  editingId: string | null = null;

  model: ProductForm = this.empty();
  errors: Partial<Record<keyof ProductForm, string>> = {};
  alertMsg: string | null = null;

  private empty(): ProductForm {
    return {
      id: '',
      name: '',
      category: 'estrategia',
      description: '',
      price: null,
      oldPrice: null,
      stock: null,
      players: '',
      image: '',
      onSale: false,
    };
  }

  openNew(): void {
    this.editingId = null;
    this.model = this.empty();
    this.errors = {};
    this.alertMsg = null;
    this.open.set(true);
  }

  openEdit(p: Product): void {
    this.editingId = p.id;
    this.model = {
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      stock: p.stock,
      players: p.players,
      image: p.image,
      onSale: !!p.onSale,
    };
    this.errors = {};
    this.alertMsg = null;
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  remove(p: Product): void {
    if (confirm(`¿Eliminar el producto "${p.id}"?`)) {
      this.productService.remove(p.id);
    }
  }

  submit(_form: NgForm): void {
    this.alertMsg = null;
    this.errors = {};

    if (!this.editingId) {
      if (!this.model.id || !/^[a-z0-9-]+$/i.test(this.model.id)) {
        this.errors.id = 'Usa solo letras, números y guiones.';
      }
    }
    if (!this.model.name.trim()) this.errors.name = 'Ingresa el nombre.';
    if (!this.model.description.trim()) this.errors.description = 'Describe el producto.';
    if (!this.model.price || Number(this.model.price) <= 0) this.errors.price = 'Precio inválido.';
    if (this.model.stock === null || isNaN(Number(this.model.stock)) || Number(this.model.stock) < 0)
      this.errors.stock = 'Stock inválido.';

    if (Object.keys(this.errors).length > 0) return;

    const data: Partial<Product> = {
      id: this.model.id,
      name: this.model.name,
      category: this.model.category,
      description: this.model.description,
      price: Number(this.model.price),
      oldPrice: this.model.oldPrice ? Number(this.model.oldPrice) : null,
      stock: Number(this.model.stock),
      players: this.model.players,
      image: this.model.image || this.model.id + '.jpg',
      onSale: this.model.onSale,
    };

    try {
      if (this.editingId) this.productService.update(this.editingId, data);
      else this.productService.create(data);
      this.close();
    } catch (err) {
      this.alertMsg = (err as Error).message;
    }
  }
}
