import { Component, OnInit, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductsService } from '../../shared/services/products.service';
import { CategoriesService } from '../../shared/services/categories.service';
import { CartService } from '../../shared/services/cart.service';
import { Product } from '../../shared/models/product.model';
import { Category } from '../../shared/models/category.model';

@Component({
  selector: 'app-cardapio',
  imports: [ProductCard, MatIconModule],
  templateUrl: './cardapio.html',
  styleUrl: './cardapio.scss',
})
export class Cardapio implements OnInit {
  activeCategory = 'todos';
  searchTerm = '';

  readonly cartNotice: Signal<string | null>;

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.cartNotice = this.cartService.cartNotice;
    if (this.cartNotice()) window.setTimeout(() => this.cartService.clearNotice(), 5000);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchTerm = params['busca'] ?? '';
      this.activeCategory = params['categoria'] ?? 'todos';
    });
  }

  get categories(): Category[] {
    return this.categoriesService.getAllCategories();
  }

  get loading(): boolean {
    return !this.productsService.loaded();
  }

  get loadFailed(): boolean {
    return this.productsService.loadFailed();
  }

  get filteredProducts(): Product[] {
    let result = this.productsService.getAllProducts();

    if (this.activeCategory !== 'todos') {
      result = result.filter((p) => p.categoryIds.includes(this.activeCategory));
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }

    return result;
  }

  selectCategory(categoryId: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoryId === 'todos' ? null : categoryId },
      queryParamsHandling: 'merge',
    });
  }

  dismissCartNotice(): void {
    this.cartService.clearNotice();
  }
}