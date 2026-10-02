import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../../shared/services/products.service';
import { Product } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-produto-show',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './produtos-show.html',
  styleUrl: './produtos-show.scss',
})
export class ProdutoShow implements OnInit {
  product: Product | undefined;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.product = id ? this.productsService.getProductById(id) : undefined;
    this.notFound = !this.product;
  }

  deleteProduct(): void {
    if (!this.product) return;

    const confirmed = confirm(`Tem certeza que deseja excluir "${this.product.name}"?`);
    if (confirmed) {
      this.productsService.deleteProduct(this.product.id);
      this.router.navigate(['/admin/produtos']);
    }
  }
}