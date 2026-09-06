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
    imageUrl:
      'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=500&q=80',
  },
  {
    id: 'ref-2',
    name: 'Frango Grelhado com Salada',
    category: 'refeicoes',
    price: 49.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&q=80',
  },
  {
    id: 'ref-3',
    name: 'Asas de Frango Crocantes',
    category: 'refeicoes',
    price: 59.99,
    rating: 4.9,
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7jVOvIhWO0VD4tQ8S338n8Ute1CwX0kvwwqL-CBiufEGwyZh71wVrgWk&s=10',
  },
  {
    id: 'ref-4',
    name: 'Frango à Passarinho',
    category: 'refeicoes',
    price: 44.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
  },
  {
    id: 'ref-5',
    name: 'Frango à Parmegiana',
    category: 'refeicoes',
    price: 47.99,
    rating: 4.9,
    imageUrl:
      'https://www.receitasja.com.br/wp-content/uploads/2024/10/file-parmegiana-e1728685958140.webp',
  },
  {
    id: 'ref-6',
    name: 'Coxinha da Asa ao Molho Barbecue',
    category: 'refeicoes',
    price: 42.99,
    rating: 4.7,
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ35TB5AUqAN122lOrl9nnzfH77eC8qKOuGqbC4ldnilTUJs33mDpVE85P&s=10',
  },
  {
    id: 'ref-7',
    name: 'Peito de Frango Recheado',
    category: 'refeicoes',
    price: 46.99,
    rating: 4.6,
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6b2Jqfvh3sHjvIw1iul8tta-P_530RKfza71igLVEyGHvuFncIDiTLpYh&s=10',
  },
  {
    id: 'ref-8',
    name: 'Sobrecoxa Assada com Batatas',
    category: 'refeicoes',
    price: 41.99,
    rating: 4.8,
    imageUrl:
      'https://guiadacozinha.com.br/wp-content/uploads/2019/10/coxa-e-sobrecoxa-assada-47429.jpg',
  },
  {
    id: 'ref-9',
    name: 'Strogonoff de Frango',
    category: 'refeicoes',
    price: 43.99,
    rating: 4.9,
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzfTnizun1XcSmLrQ7lwGwa7jwMwpOarSZ2MG5pct4mYJpv9F-_0x0tSnW&s=10',
  },
  {
    id: 'ref-10',
    name: 'Frango Xadrez',
    category: 'refeicoes',
    price: 45.99,
    rating: 4.7,
    imageUrl:
      'https://edge.osuper.com.br/XgORjkiFU8JM6wgQAfflEwdSk0s=/0x600/smart/https://osuper-ecommerce-cotrifacil.s3.sa-east-1.amazonaws.com/536af8d0-086f15bbgchinagarden9f7cf4724f.jpg',
  },

  {
    id: 'ref-11',
    name: 'Filé de Frango Grelhado',
    category: 'refeicoes',
    price: 38.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&q=80',
  },
  {
    id: 'ref-12',
    name: 'Frango Crocante com Fritas',
    category: 'refeicoes',
    price: 39.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=500&q=80',
  },
  {
    id: 'ref-13',
    name: 'Frango Grelhado com Arroz e Feijão',
    category: 'refeicoes',
    price: 36.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
  },
  {
    id: 'ref-14',
    name: 'Parmegiana de Frango com Fritas',
    category: 'refeicoes',
    price: 52.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=500&q=80',
  },
  {
    id: 'ref-15',
    name: 'Frango Cremoso com Queijo',
    category: 'refeicoes',
    price: 48.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=500&q=80',
  },
  {
    id: 'ref-16',
    name: 'Filé de Frango ao Molho de Mostarda',
    category: 'refeicoes',
    price: 45.99,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80',
  },
  {
    id: 'ref-17',
    name: 'Frango Assado com Farofa',
    category: 'refeicoes',
    price: 42.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&q=80',
  },
  {
    id: 'ref-18',
    name: 'Frango ao Molho de Alho',
    category: 'refeicoes',
    price: 44.99,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&q=80',
  },
  {
    id: 'ref-19',
    name: 'Frango com Creme de Milho',
    category: 'refeicoes',
    price: 46.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
  },
  {
    id: 'ref-20',
    name: 'Frango Empanado com Arroz Cremoso',
    category: 'refeicoes',
    price: 43.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&q=80',
  },
  {
    id: 'ref-21',
    name: 'Frango Desfiado com Purê de Batata',
    category: 'refeicoes',
    price: 39.99,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80',
  },
  {
    id: 'ref-22',
    name: 'Coxa e Sobrecoxa Assadas',
    category: 'refeicoes',
    price: 43.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&q=80',
  },
  {
    id: 'ref-23',
    name: 'Frango ao Molho de Ervas',
    category: 'refeicoes',
    price: 44.99,
    rating: 4.6,
    imageUrl:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80',
  },
  {
    id: 'ref-24',
    name: 'Combo Frango Crocante + Fritas',
    category: 'refeicoes',
    price: 54.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80',
  },
  {
    id: 'ref-25',
    name: 'Frango Grelhado com Legumes',
    category: 'refeicoes',
    price: 47.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80',
  },

  // ============================================================
  // APERITIVOS
  // ============================================================
  {
    id: 'ape-1',
    name: 'Asinhas de Frango Barbecue',
    category: 'aperitivos',
    price: 29.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80',
  },
  {
    id: 'ape-2',
    name: 'Asinhas de Frango Picantes',
    category: 'aperitivos',
    price: 31.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80',
  },
  {
    id: 'ape-3',
    name: 'Tiras de Frango Crocantes',
    category: 'aperitivos',
    price: 27.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80',
  },
  {
    id: 'ape-4',
    name: 'Nuggets Artesanais de Frango',
    category: 'aperitivos',
    price: 24.99,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=500&q=80',
  },
  {
    id: 'ape-5',
    name: 'Coxinha da Asa Crocante',
    category: 'aperitivos',
    price: 28.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80',
  },
  {
    id: 'ape-6',
    name: 'Iscas de Frango com Molho Especial',
    category: 'aperitivos',
    price: 29.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=500&q=80',
  },
  {
    id: 'ape-7',
    name: 'Frango Empanado com Barbecue',
    category: 'aperitivos',
    price: 30.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=500&q=80',
  },
  {
    id: 'ape-8',
    name: 'Batata Frita com Cheddar',
    category: 'aperitivos',
    price: 22.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80',
  },
  {
    id: 'ape-9',
    name: 'Batata Rústica com Ervas',
    category: 'aperitivos',
    price: 19.99,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=500&q=80',
  },
  {
    id: 'ape-10',
    name: 'Mandioca Frita Crocante',
    category: 'aperitivos',
    price: 18.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1639024471283-03518883512d?w=500&q=80',
  },
  {
    id: 'ape-11',
    name: 'Polenta Frita com Parmesão',
    category: 'aperitivos',
    price: 21.99,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80',
  },
  {
    id: 'ape-12',
    name: 'Combo Aperitivo da Casa',
    category: 'aperitivos',
    price: 49.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80',
  },
  {
    id: 'ape-13',
    name: 'Asinhas ao Molho de Mel e Mostarda',
    category: 'aperitivos',
    price: 32.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80',
  },
  {
    id: 'ape-14',
    name: 'Asinhas ao Molho de Alho',
    category: 'aperitivos',
    price: 30.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80',
  },
  {
    id: 'ape-15',
    name: 'Tiras de Frango com Cheddar',
    category: 'aperitivos',
    price: 31.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=500&q=80',
  },
  {
    id: 'ape-16',
    name: 'Bolinho de Frango com Queijo',
    category: 'aperitivos',
    price: 23.99,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
  },
  {
    id: 'ape-17',
    name: 'Mini Coxinhas de Frango',
    category: 'aperitivos',
    price: 21.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=500&q=80',
  },
  {
    id: 'ape-18',
    name: 'Chips de Batata com Molho da Casa',
    category: 'aperitivos',
    price: 19.99,
    rating: 4.6,
    imageUrl:
      'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80',
  },
  {
    id: 'ape-19',
    name: 'Batata Frita com Bacon e Cheddar',
    category: 'aperitivos',
    price: 27.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&q=80',
  },
  {
    id: 'ape-20',
    name: 'Combo Asinhas + Batata',
    category: 'aperitivos',
    price: 39.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80',
  },

  // ============================================================
  // BEBIDAS
  // ============================================================
  {
    id: 'beb-1',
    name: 'Refrigerante Cola 2L',
    category: 'bebidas',
    price: 14.99,
    rating: 4.9,
    imageUrl:
      'https://acdn-us.mitiendanube.com/stores/001/043/122/products/499_secundario-8f5cb963633401774117745586921722-1024-1024.webp',
    isDrink: true,
  },
  {
    id: 'beb-2',
    name: 'Suco Natural de Laranja',
    category: 'bebidas',
    price: 9.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-3',
    name: 'Água Mineral 500ml',
    category: 'bebidas',
    price: 4.99,
    rating: 4.9,
    imageUrl:
      'https://www.imigrantesbebidas.com.br/bebida/images/products/full/2893-agua-mineral-crystal-sem-gas-500ml.jpg',
    isDrink: true,
  },
  {
    id: 'beb-4',
    name: 'Chá Gelado de Pêssego',
    category: 'bebidas',
    price: 8.99,
    rating: 4.6,
    imageUrl:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-5',
    name: 'Suco de Uva Integral',
    category: 'bebidas',
    price: 10.99,
    rating: 4.8,
    imageUrl:
      'https://www.vinhosevinhos.com/media/catalog/product/cache/f551083cd20de7ac8cf7d25adc91480d/s/u/suco-de-uva-quinta-do-morgado-tinto-1l.jpg',
    isDrink: true,
  },

  {
    id: 'beb-6',
    name: 'Refrigerante Guaraná 2L',
    category: 'bebidas',
    price: 13.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-7',
    name: 'Refrigerante Cola Lata 350ml',
    category: 'bebidas',
    price: 6.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-8',
    name: 'Refrigerante Guaraná Lata 350ml',
    category: 'bebidas',
    price: 6.49,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-9',
    name: 'Suco Natural de Maracujá',
    category: 'bebidas',
    price: 10.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-10',
    name: 'Suco Natural de Abacaxi',
    category: 'bebidas',
    price: 9.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-11',
    name: 'Suco Natural de Morango',
    category: 'bebidas',
    price: 11.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-12',
    name: 'Limonada Natural',
    category: 'bebidas',
    price: 8.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-13',
    name: 'Limonada Suíça',
    category: 'bebidas',
    price: 10.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-14',
    name: 'Água Mineral com Gás 500ml',
    category: 'bebidas',
    price: 5.49,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-15',
    name: 'Chá Gelado de Limão',
    category: 'bebidas',
    price: 8.99,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-16',
    name: 'Chá Gelado de Frutas Vermelhas',
    category: 'bebidas',
    price: 9.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-17',
    name: 'Suco de Acerola',
    category: 'bebidas',
    price: 9.99,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-18',
    name: 'Água de Coco',
    category: 'bebidas',
    price: 8.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1581375074612-d1fd0e661aeb?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-19',
    name: 'Refrigerante Laranja 2L',
    category: 'bebidas',
    price: 13.99,
    rating: 4.6,
    imageUrl:
      'https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?w=500&q=80',
    isDrink: true,
  },
  {
    id: 'beb-20',
    name: 'Água Mineral 1,5L',
    category: 'bebidas',
    price: 7.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=500&q=80',
    isDrink: true,
  },

  // ============================================================
  // SOBREMESAS
  // ============================================================
  {
    id: 'sob-1',
    name: 'Brownie com Chocolate',
    category: 'sobremesas',
    price: 12.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=500&q=80',
  },
  {
    id: 'sob-2',
    name: 'Brownie com Sorvete',
    category: 'sobremesas',
    price: 17.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80',
  },
  {
    id: 'sob-3',
    name: 'Pudim de Leite Condensado',
    category: 'sobremesas',
    price: 11.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
  },
  {
    id: 'sob-4',
    name: 'Cheesecake de Frutas Vermelhas',
    category: 'sobremesas',
    price: 16.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80',
  },
  {
    id: 'sob-5',
    name: 'Torta de Chocolate',
    category: 'sobremesas',
    price: 15.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
  },
  {
    id: 'sob-6',
    name: 'Mousse de Chocolate',
    category: 'sobremesas',
    price: 10.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80',
  },
  {
    id: 'sob-7',
    name: 'Mousse de Maracujá',
    category: 'sobremesas',
    price: 10.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80',
  },
  {
    id: 'sob-8',
    name: 'Pavê de Chocolate',
    category: 'sobremesas',
    price: 12.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&q=80',
  },
  {
    id: 'sob-9',
    name: 'Banoffee',
    category: 'sobremesas',
    price: 15.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500&q=80',
  },
  {
    id: 'sob-10',
    name: 'Torta de Limão',
    category: 'sobremesas',
    price: 13.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500&q=80',
  },
  {
    id: 'sob-11',
    name: 'Doce de Leite com Queijo',
    category: 'sobremesas',
    price: 11.99,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80',
  },
  {
    id: 'sob-12',
    name: 'Brigadeiro Gourmet',
    category: 'sobremesas',
    price: 9.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500&q=80',
  },
  {
    id: 'sob-13',
    name: 'Cocada Cremosa',
    category: 'sobremesas',
    price: 9.99,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
  },
  {
    id: 'sob-14',
    name: 'Romeu e Julieta',
    category: 'sobremesas',
    price: 12.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80',
  },
  {
    id: 'sob-15',
    name: 'Pudim de Chocolate',
    category: 'sobremesas',
    price: 12.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
  },
  {
    id: 'sob-16',
    name: 'Mini Churros com Doce de Leite',
    category: 'sobremesas',
    price: 13.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1624371414361-e670edf4898d?w=500&q=80',
  },
  {
    id: 'sob-17',
    name: 'Petit Gâteau de Chocolate',
    category: 'sobremesas',
    price: 18.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
  },
  {
    id: 'sob-18',
    name: 'Cheesecake de Maracujá',
    category: 'sobremesas',
    price: 16.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80',
  },
  {
    id: 'sob-19',
    name: 'Torta Holandesa',
    category: 'sobremesas',
    price: 15.99,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&q=80',
  },
  {
    id: 'sob-20',
    name: 'Brigadeiro com Morango',
    category: 'sobremesas',
    price: 13.99,
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500&q=80',
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