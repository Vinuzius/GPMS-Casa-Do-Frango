import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../../shared/services/products.service';
import { Product } from '../../../../shared/models/product.model';
import { CategoriesService } from '../../../../shared/services/categories.service';
import { Category } from '../../../../shared/models/category.model';
import { TagSelect } from '../../../../shared/components/tag-select/tag-select';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [FormsModule, TagSelect],
  templateUrl: './produtos-form.html',
  styleUrl: './produtos-form.scss',
})
export class ProdutoForm implements OnInit {
  isEditMode = false;
  productId: string | null = null;
  categories: Category[] = [];

  formData: Omit<Product, 'id'> = {
    name: '',
    description: '',
    categoryIds: [],
    price: 0,
    rating: 5,
    imageUrl: '',
    isDrink: false,
    available: true,
    sizes: [],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;
    this.categories = this.categoriesService.getAllCategories();

    if (this.isEditMode && this.productId) {
      const existing = this.productsService.getProductById(this.productId);
      if (existing) {
        const { id, ...rest } = existing;
        this.formData = { ...rest, sizes: existing.sizes ? [...existing.sizes] : [] };
      }
    }
  }

  addSize(): void {
    this.formData.sizes = [...(this.formData.sizes ?? []), { label: '', priceModifier: 0 }];
  }

  removeSize(index: number): void {
    this.formData.sizes = this.formData.sizes?.filter((_, i) => i !== index);
  }

  onSubmit(): void {
    if (this.isEditMode && this.productId) {
      this.productsService.updateProduct(this.productId, this.formData);
    } else {
      this.productsService.createProduct(this.formData);
    }
    this.router.navigate(['/admin/produtos']);
  }

  cancel(): void {
    if (this.isEditMode && this.productId) {
      this.router.navigate(['/admin/produtos', this.productId]);
    } else {
      this.router.navigate(['/admin/produtos']);
    }
  }
}