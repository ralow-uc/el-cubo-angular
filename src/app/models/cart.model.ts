import { Product } from './product.model';

export type CartMap = Record<string, number>;

export interface CartLine {
  product: Product;
  qty: number;
  subtotal: number;
}
