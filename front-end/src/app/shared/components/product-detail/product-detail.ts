// product-detail/product-detail.ts
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product, ProductSize } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  product: Product | undefined;
  notFound = false;

  selectedSize: ProductSize | undefined;
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private location: Location, // lembrar onde tava na pagina
    private router: Router, // para navegar para outra rota

  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.product = id ? this.productsService.getProductById(id) : undefined;
    this.notFound = !this.product;

    if (this.product?.sizes?.length) {
      this.selectedSize = this.product.sizes[0];
    }
  }

  get isUnavailable(): boolean {
    return this.product?.available === false;
  }

  get finalPrice(): number {
    if (!this.product) return 0;
    return this.product.price + (this.selectedSize?.priceModifier ?? 0);
  }

  selectSize(size: ProductSize): void {
    this.selectedSize = size;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/cardapio']);
    }
  }

  addToCart(): void {
    // Placeholder — sem carrinho implementado ainda.
    console.log('Adicionado ao carrinho:', {
      product: this.product,
      size: this.selectedSize,
      quantity: this.quantity,
      totalPrice: this.finalPrice * this.quantity,
    });
  }
}
