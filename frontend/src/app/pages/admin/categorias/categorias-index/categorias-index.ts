import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoriesService } from '../../../../shared/services/categories.service';
import { Category } from '../../../../shared/models/category.model';
import { mensagemDeErro } from '../../../../shared/utils/http-error';

@Component({
  selector: 'app-categorias-index',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categorias-index.html',
  styleUrl: './categorias-index.scss',
})
export class CategoriasIndex {
  constructor(private categoriesService: CategoriesService) {}

  get categories(): Category[] {
    return this.categoriesService.getAllCategories();
  }

  async deleteCategory(category: Category): Promise<void> {
    const confirmed = confirm(
      `Excluir "${category.name}"? Produtos associados não serão excluídos, apenas perderão essa categoria.`,
    );
    if (!confirmed) return;

    try {
      await this.categoriesService.deleteCategory(category.id);
    } catch (erro) {
      alert(mensagemDeErro(erro, 'Não foi possível excluir a categoria.'));
    }
  }
}