import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { SEED_PRODUCTS } from '../data/seed';
import { STORAGE_KEYS, read, write } from './storage.util';

/**
 * Catálogo de productos persistido en `localStorage`.
 *
 * Expone una signal `products` con la lista completa y métodos CRUD
 * utilizados por la vista pública y por los mantenedores del admin.
 *
 * En la primera carga siembra los 12 juegos del catálogo demo.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  /** Lista reactiva de productos. */
  readonly products = signal<Product[]>([]);

  constructor() {
    this.seedIfEmpty();
    this.products.set(read<Product[]>(STORAGE_KEYS.products, []));
  }

  private seedIfEmpty(): void {
    if (read(STORAGE_KEYS.products, null) === null) {
      write(STORAGE_KEYS.products, SEED_PRODUCTS);
    }
  }

  private persist(list: Product[]): void {
    write(STORAGE_KEYS.products, list);
    this.products.set([...list]);
  }

  /** Devuelve todos los productos del catálogo. */
  all(): Product[] {
    return this.products();
  }

  /** Busca un producto por su id; devuelve `null` si no existe. */
  byId(id: string): Product | null {
    return this.products().find((p) => p.id === id) ?? null;
  }

  /**
   * @description
   * Filtra el catálogo por el slug de categoría.
   *
   * @param slug Una de `'estrategia' | 'familiares' | 'cartas' | 'cooperativos'`.
   * @returns Lista de productos de esa categoría (vacía si no hay coincidencias).
   *
   * @usageNotes
   * ```ts
   * products.byCategory('estrategia')  // [Catan, Carcassonne, Twilight Imperium]
   * ```
   */
  byCategory(slug: string): Product[] {
    return this.products().filter((p) => p.category === slug);
  }

  /**
   * @description
   * Agrega un nuevo producto al catálogo.
   *
   * @param data Datos del producto. El `id` es obligatorio y único.
   * @returns El producto recién creado (normalizado).
   * @throws Error si el `id` ya existe o no se proporciona.
   */
  create(data: Partial<Product>): Product {
    const list = [...this.products()];
    if (!data.id) throw new Error('El ID es obligatorio.');
    if (list.some((p) => p.id === data.id)) {
      throw new Error('Ya existe un producto con ese ID.');
    }
    const product: Product = {
      id: data.id,
      name: (data.name ?? '').trim(),
      category: (data.category ?? 'estrategia') as Product['category'],
      price: Number(data.price ?? 0),
      oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
      onSale: !!data.onSale,
      image: data.image || 'placeholder.jpg',
      description: (data.description ?? '').trim(),
      players: data.players ?? '',
      stock: Number(data.stock ?? 0),
    };
    list.push(product);
    this.persist(list);
    return product;
  }

  /** Modifica los campos del producto `id`. Lanza error si no existe. */
  update(id: string, patch: Partial<Product>): Product {
    const list = [...this.products()];
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Producto no encontrado.');
    const current = list[idx];
    list[idx] = {
      ...current,
      ...patch,
      price: patch.price !== undefined ? Number(patch.price) : current.price,
      oldPrice:
        patch.oldPrice !== undefined
          ? patch.oldPrice
            ? Number(patch.oldPrice)
            : null
          : current.oldPrice,
      stock: patch.stock !== undefined ? Number(patch.stock) : current.stock,
      onSale: patch.onSale !== undefined ? !!patch.onSale : current.onSale,
    };
    this.persist(list);
    return list[idx];
  }

  /** Borra el producto `id` del catálogo. */
  remove(id: string): void {
    const list = this.products().filter((p) => p.id !== id);
    this.persist(list);
  }

  /** Resta `qty` unidades del stock del producto, sin bajar de 0. */
  discountStock(productId: string, qty: number): void {
    const p = this.byId(productId);
    if (!p) return;
    this.update(productId, { stock: Math.max(0, p.stock - qty) });
  }
}
