import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';
import { CartService } from '../../shared/services/cart.service';
import { OrdersService } from '../../shared/services/orders.service';

type ServiceType = 'delivery' | 'pickup';
type PaymentType = 'pix' | 'card';

interface Address {
  label: string;
  isPrimary: boolean;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

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
  readonly cartNotice;
  readonly cartItems;
  readonly itemCount;
  readonly subtotal;
  selectedService = signal<ServiceType>('delivery');
  selectedPayment = signal<PaymentType>('pix');
  checkoutStep = signal<'cart' | 'payment'>('cart');
  readonly addresses = signal<Address[]>(this.loadAddresses());
  selectedAddress = signal<Address | null>(this.addresses()[0] ?? null);
  addressDraft: Address = this.emptyAddress();
  isAddressMenuOpen = signal(false);
  coupon = '';

  constructor(
    private cartService: CartService,
    private ordersService: OrdersService,
    private router: Router,
  ) {
    this.cartNotice = this.cartService.cartNotice;
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
    const item = this.cartItems()[index];
    this.cartService.decrease(index);
    if (item?.quantity === 1) {
      this.showNotice(`Produto removido com sucesso.`);
    }
  }

  removeItem(index: number): void {
    const item = this.cartItems()[index];
    this.cartService.remove(index);
    if (item) this.showNotice(`Produto removido com sucesso.`);
  }

  dismissCartNotice(): void {
    this.cartService.clearNotice();
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

  toggleAddressMenu(): void {
    this.isAddressMenuOpen.update((isOpen) => !isOpen);
  }

  selectAddress(address: Address): void {
    this.selectedAddress.set(address);
    this.isAddressMenuOpen.set(false);
  }

  saveAddress(): void {
    if (!this.addressDraft.street.trim() || !this.addressDraft.number.trim()) return;

    const address: Address = {
      ...this.addressDraft,
      label: this.addressDraft.label.trim() || 'Casa',
      isPrimary: this.addresses().length === 0,
    };
    const updatedAddresses = [...this.addresses(), address];
    this.addresses.set(updatedAddresses);
    this.selectedAddress.set(address);
    this.addressDraft = this.emptyAddress();
    localStorage.setItem('casa-do-frango-addresses', JSON.stringify(updatedAddresses));
    this.showNotice('Endereço salvo com sucesso.');
  }

  finishOrder(): void {
    if (this.selectedService() === 'delivery' && !this.selectedAddress()) {
      this.showNotice('Cadastre um endereço para receber seu pedido.');
      return;
    }

    const order = this.ordersService.confirmOrder(this.selectedService(), this.selectedPayment());
    if (order) this.router.navigate(['/pedidos']);
  }

  private loadAddresses(): Address[] {
    const storedAddresses = localStorage.getItem('casa-do-frango-addresses');

    if (storedAddresses) {
      try {
        const addresses = JSON.parse(storedAddresses) as Address[];
        if (Array.isArray(addresses) && addresses.length) return addresses;
      } catch {
        localStorage.removeItem('casa-do-frango-addresses');
      }
    }

    return [];
  }

  private emptyAddress(): Address {
    return {
      label: '',
      isPrimary: false,
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    };
  }

  private showNotice(message: string): void {
    this.cartService.showNotice(message);
    window.setTimeout(() => {
      if (this.cartService.cartNotice() === message) this.cartService.clearNotice();
    }, 5000);
  }
}
