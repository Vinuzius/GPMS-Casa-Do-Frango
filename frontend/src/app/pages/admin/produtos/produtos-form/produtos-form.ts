import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../../shared/services/products.service';
import { ProductInput } from '../../../../shared/models/product.model';
import { CategoriesService } from '../../../../shared/services/categories.service';
import { Category } from '../../../../shared/models/category.model';
import { TagSelect } from '../../../../shared/components/tag-select/tag-select';
import { mensagemDeErro } from '../../../../shared/utils/http-error';

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
  readonly erro = signal<string | null>(null);

  formData: ProductInput = {
    name: '',
    description: '',
    categoryIds: [],
    price: 0,
    imageUrl: '',
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

    // o cardapioResolver da rota garante que os produtos já foram carregados
    if (this.isEditMode && this.productId) {
      const existing = this.productsService.getProductById(this.productId);
      if (existing) {
        const { id, isDrink, ...rest } = existing;
        this.formData = {
          ...rest,
          categoryIds: [...existing.categoryIds],
          available: existing.available !== false,
          sizes: (existing.sizes ?? []).map((size) => ({ ...size })),
        };
      }
    }
  }

  get categories(): Category[] {
    return this.categoriesService.getAllCategories();
  }

  addSize(): void {
    this.formData.sizes = [...(this.formData.sizes ?? []), { label: '', priceModifier: 0 }];
  }

  removeSize(index: number): void {
    this.formData.sizes = this.formData.sizes?.filter((_, i) => i !== index);
  }

  async onSubmit(): Promise<void> {
    this.erro.set(null);

    try {
      if (this.isEditMode && this.productId) {
        await this.productsService.updateProduct(this.productId, this.formData);
      } else {
        await this.productsService.createProduct(this.formData);
      }
      this.router.navigate(['/admin/produtos']);
    } catch (erro) {
      this.erro.set(mensagemDeErro(erro, 'Não foi possível salvar o produto.'));
    }
  }

  cancel(): void {
    if (this.isEditMode && this.productId) {
      this.router.navigate(['/admin/produtos', this.productId]);
    } else {
      this.router.navigate(['/admin/produtos']);
    }
  }
}