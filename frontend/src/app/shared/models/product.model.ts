export interface ProductSize {
  label: string;
  priceModifier: number; // valor somado ao preço base (0 = tamanho padrão)
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryIds: string[];
  price: number;
  imageUrl: string;
  isDrink?: boolean; // derivado da categoria "bebidas", só muda o estilo do card
  available?: boolean;
  sizes?: ProductSize[]; // opcional — só produtos com variação de tamanho têm isso
}

// Dados que o admin informa ao criar ou editar um produto
export type ProductInput = Omit<Product, 'id' | 'isDrink'>;
