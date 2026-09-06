import { Component, signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';
import { CartService } from '../../shared/services/cart.service';

type ServiceType = 'delivery' | 'pickup';

@Component({
  selector: 'app-carrinho',
  imports: [
    ...SHARED_IMPORTS,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.scss',
})
export class Carrinho {
  readonly cartItems;
  readonly itemCount;
  readonly subtotal;
  selectedService = signal<ServiceType>('delivery');

  constructor(private cartService: CartService) {
    this.cartItems = this.cartService.cartItems;
    this.itemCount = this.cartService.itemCount;
    this.subtotal = this.cartService.subtotal;
  }

  selectService(service: ServiceType): void {
    this.selectedService.set(service);
  }

  increaseQuantity(index: number): void {
    this.cartService.increase(index);
  }

  decreaseQuantity(index: number): void {
    this.cartService.decrease(index);
  }
}
