import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../../shared/services/products.service';
import { Product } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-produtos-index',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './produtos-index.html',
  styleUrl: './produtos-index.scss',
})
export class ProdutosIndex implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 8;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.allProducts = this.productsService.getAllProducts();
    this.applyFilter();
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredProducts = term
      ? this.allProducts.filter((p) => p.name.toLowerCase().includes(term))
      : this.allProducts;

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