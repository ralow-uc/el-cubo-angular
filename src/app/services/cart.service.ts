import { Injectable, computed, inject, signal } from '@angular/core';
import { CartLine, CartMap } from '../models/cart.model';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';
import { STORAGE_KEYS, read, write } from './storage.util';

type AllCarts = Record<string, CartMap>;

/**
 * Carrito de compras por usuario, persistido en `localStorage`.
 *
 * El estado vive en una signal `allCarts` indexada por `userId`. Las
 * lecturas (`currentCart`, `lines`, `count`, `total`) son `computed`
 * y se actualizan automáticamente cuando cambia el carrito o la sesión.
 *
 * Las operaciones de escritura están protegidas: requieren sesión y
 * bloquean al rol admin (que no puede comprar).
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private auth = inject(AuthService);
  private products = inject(ProductService);

  private allCarts = signal<AllCarts>({});

  readonly currentCart = computed<CartMap>(() => {
    const s = this.auth.session();
    if (!s) return {};
    return this.allCarts()[s.userId] ?? {};
  });

  readonly lines = computed<CartLine[]>(() => {
    const cart = this.currentCart();
    return Object.entries(cart)
      .map(([pid, qty]) => {
        const product = this.products.byId(pid);
        if (!product) return null;
        return {
          product,
          qty,
          subtotal: product.price * qty,
        } as CartLine;
      })
      .filter((l): l is CartLine => l !== null);
  });

  readonly count = computed<number>(() =>
    Object.values(this.currentCart()).reduce((a, b) => a + b, 0)
  );

  readonly total = computed<number>(() =>
    this.lines().reduce((a, l) => a + l.subtotal, 0)
  );

  constructor() {
    if (read(STORAGE_KEYS.cart, null) === null) write(STORAGE_KEYS.cart, {});
    this.allCarts.set(read<AllCarts>(STORAGE_KEYS.cart, {}));
  }

  private persist(carts: AllCarts): void {
    write(STORAGE_KEYS.cart, carts);
    this.allCarts.set({ ...carts });
  }

  private withUser<T>(fn: (userId: string) => T): T | undefined {
    const s = this.auth.session();
    if (!s) return undefined;
    return fn(s.userId);
  }

  /** Suma `qty` unidades del producto al carrito del usuario logueado. */
  add(productId: string, qty = 1): void {
    const s = this.auth.session();
    if (!s) throw new Error('Debes iniciar sesión para agregar al carrito.');
    if (s.role === 'admin')
      throw new Error('Los administradores no pueden comprar.');
    const carts = { ...this.allCarts() };
    const cart = { ...(carts[s.userId] ?? {}) };
    cart[productId] = (cart[productId] ?? 0) + qty;
    carts[s.userId] = cart;
    this.persist(carts);
  }

  /** Fija la cantidad exacta del producto. Si `qty <= 0` lo remueve. */
  setQty(productId: string, qty: number): void {
    this.withUser((userId) => {
      const carts = { ...this.allCarts() };
      const cart = { ...(carts[userId] ?? {}) };
      if (qty <= 0) delete cart[productId];
      else cart[productId] = qty;
      carts[userId] = cart;
      this.persist(carts);
    });
  }

  /** Quita el producto del carrito. */
  remove(productId: string): void {
    this.setQty(productId, 0);
  }

  /** Vacía el carrito del usuario logueado. */
  clear(): void {
    this.withUser((userId) => {
      const carts = { ...this.allCarts() };
      carts[userId] = {};
      this.persist(carts);
    });
  }
}
