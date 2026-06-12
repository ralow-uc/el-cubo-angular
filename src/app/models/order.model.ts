export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}
