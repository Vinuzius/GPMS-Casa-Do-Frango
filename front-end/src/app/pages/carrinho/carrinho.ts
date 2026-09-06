import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';
import { CartService } from '../../shared/services/cart.service';
import { OrdersService } from '../../shared/services/orders.service';

type ServiceType = 'delivery' | 'pickup';
type PaymentType = 'pix' | 'card';

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
  selectedPayment = signal<PaymentType>('pix');
  checkoutStep = signal<'cart' | 'payment'>('cart');
  coupon = '';

  constructor(
    private cartService: CartService,
    private ordersService: OrdersService,
    private router: Router,
  ) {
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

  continueToPayment(): void {
    if (this.cartItems().length) this.checkoutStep.set('payment');
  }

  backToCart(): void {
    this.checkoutStep.set('cart');
  }

  selectPayment(payment: PaymentType): void {
    this.selectedPayment.set(payment);
  }

  finishOrder(): void {
    const order = this.ordersService.confirmOrder(this.selectedService(), this.selectedPayment());
    if (order) this.router.navigate(['/pedidos']);
  }
}
