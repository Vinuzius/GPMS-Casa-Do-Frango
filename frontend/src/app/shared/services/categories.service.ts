import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';

const MOCK_CATEGORIES: Category[] = [
  { id: 'refeicoes', name: 'Refeições' },
  { id: 'bebidas', name: 'Bebidas' },
  { id: 'aperitivos', name: 'Aperitivos' },
  { id: 'sobremesas', name: 'Sobremesas' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  getAllCategories(): Category[] {
    return MOCK_CATEGORIES;
  }

  getCategoryById(id: string): Category | undefined {
    return MOCK_CATEGORIES.find((c) => c.id === id);
  }

  createCategory(data: Omit<Category, 'id'>): Category {
    const newCategory: Category = { id: slugify(data.name), ...data };
    MOCK_CATEGORIES.push(newCategory);
    return newCategory;
  }

  updateCategory(id: string, changes: Omit<Category, 'id'>): void {
    const index = MOCK_CATEGORIES.findIndex((c) => c.id === id);
    if (index !== -1) {
      MOCK_CATEGORIES[index] = { id, ...changes };
    }
  }

  deleteCategory(id: string): void {
    const index = MOCK_CATEGORIES.findIndex((c) => c.id === id);
    if (index !== -1) {
      MOCK_CATEGORIES.splice(index, 1);
    }
  }
}