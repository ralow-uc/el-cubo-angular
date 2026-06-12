export type Category = 'estrategia' | 'familiares' | 'cartas' | 'cooperativos';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  oldPrice?: number | null;
  onSale?: boolean;
  image: string;
  description: string;
  players: string;
  stock: number;
}
