export type ProductCategory = 'refeicoes' | 'bebidas' | 'aperitivos' | 'sobremesas';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  rating: number;
  imageUrl: string;
  isDrink?: boolean;
  available?: boolean;
}