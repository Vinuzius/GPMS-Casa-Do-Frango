import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../../shared/services/products.service';
import { Product } from '../../../../shared/models/product.model';
import { CategoriesService } from '../../../../shared/services/categories.service';
import { mensagemDeErro } from '../../../../shared/utils/http-error';


@Component({
  selector: 'app-produto-show',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './produtos-show.html',
  styleUrl: './produtos-show.scss',
})
export class ProdutoShow implements OnInit {
  private productId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,

  ) {}
  
  get categoryNames(): string {
    if (!this.product) return '';
    return this.product.categoryIds
      .map((id) => this.categoriesService.getCategoryById(id)?.name ?? id)
      .join(', ');
  }
  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
  }

  get product(): Product | undefined {
    return this.productId ? this.productsService.getProductById(this.productId) : undefined;
  }

  get notFound(): boolean {
    return !this.product;
  }

  async deleteProduct(): Promise<void> {
    const product = this.product;
    if (!product) return;

    const confirmed = confirm(`Tem certeza que deseja excluir "${product.name}"?`);
    if (!confirmed) return;

    try {
      await this.productsService.deleteProduct(product.id);
      this.router.navigate(['/admin/produtos']);
    } catch (erro) {
      alert(mensagemDeErro(erro, 'Não foi possível excluir o produto.'));
    }
  }
}