export type ProductCategory = 'refeicoes' | 'bebidas' | 'aperitivos' | 'sobremesas';

export interface ProductSize {
  label: string;
  priceModifier: number; // valor somado ao preço base (0 = tamanho padrão)
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  rating: number;
  imageUrl: string;
  isDrink?: boolean;
  available?: boolean;
  sizes?: ProductSize[]; // opcional — só produtos com variação de tamanho têm isso
}