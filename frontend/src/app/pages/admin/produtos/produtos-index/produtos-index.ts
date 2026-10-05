import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../../shared/services/products.service';
import { Product } from '../../../../shared/models/product.model';
import { CategoriesService } from '../../../../shared/services/categories.service';

@Component({
  selector: 'app-produtos-index',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './produtos-index.html',
  styleUrl: './produtos-index.scss',
})
export class ProdutosIndex {
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 8;

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
  ) {}

  get filteredProducts(): Product[] {
    const allProducts = this.productsService.getAllProducts();
    const term = this.searchTerm.trim().toLowerCase();

    return term ? allProducts.filter((p) => p.name.toLowerCase().includes(term)) : allProducts;
  }

  applyFilter(): void {
    this.currentPage = 1; // sempre volta pra primeira página ao mudar a busca
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.itemsPerPage));
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getCategoryNames(product: Product): string {
    return product.categoryIds
      .map((id) => this.categoriesService.getCategoryById(id)?.name ?? id)
      .join(', ');
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
}