import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoriesService } from '../../../../shared/services/categories.service';
import { Category } from '../../../../shared/models/category.model';

@Component({
  selector: 'app-categorias-index',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categorias-index.html',
  styleUrl: './categorias-index.scss',
})
export class CategoriasIndex implements OnInit {
  categories: Category[] = [];

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.categories = this.categoriesService.getAllCategories();
  }

  deleteCategory(category: Category): void {
    const confirmed = confirm(
      `Excluir "${category.name}"? Produtos associados não serão excluídos, apenas perderão essa categoria.`,
    );
    if (confirmed) {
      this.categoriesService.deleteCategory(category.id);
      this.categories = this.categoriesService.getAllCategories();
    }
  }
}