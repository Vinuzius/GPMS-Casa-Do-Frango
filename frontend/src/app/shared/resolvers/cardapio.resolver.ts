import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { CategoriesService } from '../services/categories.service';
import { ProductsService } from '../services/products.service';

// Espera o cardápio carregar antes de abrir telas que leem os dados no ngOnInit.
export const cardapioResolver: ResolveFn<boolean> = async () => {
  await Promise.all([inject(ProductsService).ready(), inject(CategoriesService).ready()]);
  return true;
};
