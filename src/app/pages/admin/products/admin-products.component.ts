import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { formatCLP, imageUrl } from '../../../services/storage.util';

/**
 * Mantenedor de productos del catálogo. Lista todos los items en una
 * tabla y abre un modal con Reactive Form para crear o editar.
 */
@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-products.component.html',
})
export class AdminProductsComponent {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  readonly products = this.productService.products;
  readonly formatCLP = formatCLP;
  readonly imageUrl = imageUrl;

  open = signal(false);
  editingId: string | null = null;
  alertMsg: string | null = null;

  form = this.fb.nonNullable.group({
    id: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/i)]],
    name: ['', [Validators.required]],
    category: ['estrategia' as Product['category']],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(1)]],
    oldPrice: [null as number | null],
    stock: [0, [Validators.required, Validators.min(0)]],
    players: [''],
    image: [''],
    onSale: [false],
  });

  openNew(): void {
    this.editingId = null;
    this.alertMsg = null;
    this.form.reset({
      id: '',
      name: '',
      category: 'estrategia',
      description: '',
      price: 0,
      oldPrice: null,
      stock: 0,
      players: '',
      image: '',
      onSale: false,
    });
    this.form.controls.id.enable();
    this.open.set(true);
  }

  openEdit(p: Product): void {
    this.editingId = p.id;
    this.alertMsg = null;
    this.form.reset({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      stock: p.stock,
      players: p.players ?? '',
      image: p.image ?? '',
      onSale: !!p.onSale,
    });
    this.form.controls.id.disable();
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

  errorOf(name: keyof typeof this.form.controls): string | null {
    const ctrl = this.form.controls[name];
    if (ctrl.valid || (!ctrl.touched && !ctrl.dirty)) return null;
    const e = ctrl.errors;
    if (!e) return null;
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['pattern'] && name === 'id') return 'Usa solo letras, números y guiones.';
    if (e['min'] && name === 'price') return 'Precio inválido.';
    if (e['min'] && name === 'stock') return 'Stock inválido.';
    return 'Valor inválido.';
  }

  submit(): void {
    this.alertMsg = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const data: Partial<Product> = {
      id: v.id,
      name: v.name,
      category: v.category,
      description: v.description,
      price: Number(v.price),
      oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
      stock: Number(v.stock),
      players: v.players,
      image: v.image || v.id + '.jpg',
      onSale: v.onSale,
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
