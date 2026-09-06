import { Injectable } from '@angular/core';
import { Product, ProductCategory } from '../models/product.model';

const MOCK_PRODUCTS: Product[] = [
  // Refeições
  {
    id: 'ref-1',
    name: 'Combo Frango + Linguiça',
    category: 'refeicoes',
    price: 49.99,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=500&q=80',
  },
  {
    id: 'ref-2',
    name: 'Frango Grelhado com Salada',
    category: 'refeicoes',
    price: 49.99,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&q=80',
  },
  {
    id: 'ref-3',
    name: 'Asas de Frango Crocantes',
    category: 'refeicoes',
    price: 59.99,
    rating: 4.9,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7jVOvIhWO0VD4tQ8S338n8Ute1CwX0kvwwqL-CBiufEGwyZh71wVrgWk&s=10',
  },
  {
    id: 'ref-4',
    name: 'Frango à Passarinho',
    category: 'refeicoes',
    price: 44.99,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
  },
  {
    id: 'ref-5',
    name: 'Frango à Parmegiana',
    category: 'refeicoes',
    price: 47.99,
    rating: 4.9,
    imageUrl: 'https://www.receitasja.com.br/wp-content/uploads/2024/10/file-parmegiana-e1728685958140.webp',
  },
  {
    id: 'ref-6',
    name: 'Coxinha da Asa ao Molho Barbecue',
    category: 'refeicoes',
    price: 42.99,
    rating: 4.7,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ35TB5AUqAN122lOrl9nnzfH77eC8qKOuGqbC4ldnilTUJs33mDpVE85P&s=10',
  },
  {
    id: 'ref-7',
    name: 'Peito de Frango Recheado',
    category: 'refeicoes',
    price: 46.99,
    rating: 4.6,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6b2Jqfvh3sHjvIw1iul8tta-P_530RKfza71igLVEyGHvuFncIDiTLpYh&s=10',
  },
  {
    id: 'ref-8',
    name: 'Sobrecoxa Assada com Batatas',
    category: 'refeicoes',
    price: 41.99,
    rating: 4.8,
    imageUrl: 'https://guiadacozinha.com.br/wp-content/uploads/2019/10/coxa-e-sobrecoxa-assada-47429.jpg',
  },
  {
    id: 'ref-9',
    name: 'Strogonoff de Frango',
    category: 'refeicoes',
    price: 43.99,
    rating: 4.9,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzfTnizun1XcSmLrQ7lwGwa7jwMwpOarSZ2MG5pct4mYJpv9F-_0x0tSnW&s=10',
  },
  {
    id: 'ref-10',
    name: 'Frango Xadrez',
    category: 'refeicoes',
    price: 45.99,
    rating: 4.7,
    imageUrl: 'https://edge.osuper.com.br/XgORjkiFU8JM6wgQAfflEwdSk0s=/0x600/smart/https://osuper-ecommerce-cotrifacil.s3.sa-east-1.amazonaws.com/536af8d0-086f15bbgchinagarden9f7cf4724f.jpg',
  },

  // Bebidas
  {
    id: 'beb-1',
    name: 'Refrigerante Cola 2L',
    category: 'bebidas',
    price: 14.99,
    rating: 4.9,
    imageUrl: 'https://acdn-us.mitiendanube.com/stores/001/043/122/products/499_secundario-8f5cb963633401774117745586921722-1024-1024.webp',
    isDrink: true,
  },
  {
    id: 'beb-2',
    name: 'Suco Natural de Laranja',
    category: 'bebidas',
    price: 9.99,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-3',
    name: 'Água Mineral 500ml',
    category: 'bebidas',
    price: 4.99,
    rating: 4.9,
    imageUrl: 'https://www.imigrantesbebidas.com.br/bebida/images/products/full/2893-agua-mineral-crystal-sem-gas-500ml.jpg',
    isDrink: true,
  },
  {
    id: 'beb-4',
    name: 'Chá Gelado de Pêssego',
    category: 'bebidas',
    price: 8.99,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-5',
    name: 'Suco de Uva Integral',
    category: 'bebidas',
    price: 10.99,
    rating: 4.8,
    imageUrl: 'https://www.vinhosevinhos.com/media/catalog/product/cache/f551083cd20de7ac8cf7d25adc91480d/s/u/suco-de-uva-quinta-do-morgado-tinto-1l.jpg',
    isDrink: true,
  },
];

@Injectable({ providedIn: 'root' })
export class ProductsService {
  getAllProducts(): Product[] {
    return MOCK_PRODUCTS;
  }

  getProductsByCategory(category: ProductCategory): Product[] {
    return MOCK_PRODUCTS.filter((p) => p.category === category);
  }
}