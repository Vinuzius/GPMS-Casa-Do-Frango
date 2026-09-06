import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductsService } from '../../shared/services/products.service';
import { Product, ProductCategory } from '../../shared/models/product.model';

interface CategoryOption {
  value: ProductCategory | 'todos';
  label: string;
}

@Component({
  selector: 'app-cardapio',
  imports: [ProductCard],
  templateUrl: './cardapio.html',
  styleUrl: './cardapio.scss',
})
export class Cardapio implements OnInit {
  categories: CategoryOption[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'refeicoes', label: 'Refeições' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'aperitivos', label: 'Aperitivos' },
    { value: 'sobremesas', label: 'Sobremesas' },
  ];

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  activeCategory: ProductCategory | 'todos' = 'todos';
  searchTerm = '';

  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.allProducts = this.productsService.getAllProducts();

    this.route.queryParams.subscribe((params) => {
      this.searchTerm = params['busca'] ?? '';
      this.applyFilters();
    });
  }

  selectCategory(category: ProductCategory | 'todos'): void {
    this.activeCategory = category;
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = this.allProducts;

    if (this.activeCategory !== 'todos') {
      result = result.filter((p) => p.category === this.activeCategory);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }

    this.filteredProducts = result;
  }
}