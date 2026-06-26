import { Injectable, inject, signal } from '@angular/core';
import { Order } from '../models/order.model';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { ProductService } from './product.service';
import { STORAGE_KEYS, read, write } from './storage.util';

type AllOrders = Record<string, Order[]>;

/**
 * Historial de pedidos por usuario, persistido en `localStorage`.
 *
 * El método `place()` genera una orden a partir del carrito actual,
 * descuenta el stock de cada producto y vacía el carrito en un solo paso.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private auth = inject(AuthService);
  private products = inject(ProductService);
  private cart = inject(CartService);

  private allOrders = signal<AllOrders>({});

  constructor() {
    if (read(STORAGE_KEYS.orders, null) === null) write(STORAGE_KEYS.orders, {});
    this.allOrders.set(read<AllOrders>(STORAGE_KEYS.orders, {}));
  }

  private persist(orders: AllOrders): void {
    write(STORAGE_KEYS.orders, orders);
    this.allOrders.set({ ...orders });
  }

  /** Devuelve los pedidos del usuario indicado, o del usuario logueado si se omite. */
  byUser(userId?: string): Order[] {
    const id = userId ?? this.auth.session()?.userId;
    if (!id) return [];
    return this.allOrders()[id] ?? [];
  }

  /** Junta los pedidos de TODOS los usuarios. Usado por el dashboard admin. */
  allByEveryUser(): Order[] {
    return Object.values(this.allOrders()).flat();
  }

  /**
   * @description
   * Finaliza la compra del usuario logueado en un solo paso atómico:
   *  1. Genera la orden con el contenido actual del carrito.
   *  2. Descuenta el stock de cada producto vendido.
   *  3. Vacía el carrito.
   *
   * @returns La orden creada (con id, items, total y timestamp).
   * @throws Error si no hay sesión activa o si el carrito está vacío.
   *
   * @usageNotes
   * ```ts
   * try {
   *   const order = orderService.place();
   *   router.navigate(['/pedidos']);
   * } catch (e) {
   *   alertMsg = (e as Error).message;
   * }
   * ```
   */
  place(): Order {
    const s = this.auth.session();
    if (!s) throw new Error('Debes iniciar sesión.');

    const lines = this.cart.lines();
    if (lines.length === 0) throw new Error('Tu carrito está vacío.');

    const order: Order = {
      id: 'O-' + Date.now().toString(36).toUpperCase(),
      items: lines.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        unitPrice: l.product.price,
        qty: l.qty,
        subtotal: l.subtotal,
      })),
      total: lines.reduce((a, l) => a + l.subtotal, 0),
      createdAt: new Date().toISOString(),
    };

    lines.forEach((l) => this.products.discountStock(l.product.id, l.qty));

    const all = { ...this.allOrders() };
    all[s.userId] = [order, ...(all[s.userId] ?? [])];
    this.persist(all);

    this.cart.clear();
    return order;
  }
}
