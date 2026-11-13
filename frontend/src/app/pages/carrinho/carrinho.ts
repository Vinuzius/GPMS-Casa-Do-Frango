import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';
import { Address, emptyAddress } from '../../shared/models/address.model';
import { PaymentType, ServiceType } from '../../shared/models/order.model';
import { AddressesService } from '../../shared/services/addresses.service';
import { CartService } from '../../shared/services/cart.service';
import { OrdersService } from '../../shared/services/orders.service';
import { mensagemDeErro } from '../../shared/utils/http-error';

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
  readonly addresses;
  selectedService = signal<ServiceType>('delivery');
  selectedPayment = signal<PaymentType>('pix');
  checkoutStep = signal<'cart' | 'payment'>('cart');
  private readonly selectedAddressId = signal<number | null>(null);
  readonly selectedAddress = computed<Address | null>(() => {
    const addresses = this.addresses();
    return (
      addresses.find((a) => a.id === this.selectedAddressId()) ??
      addresses.find((a) => a.isPrimary) ??
      addresses[0] ??
      null
    );
  });
  addressDraft: Address = emptyAddress();
  isAddressMenuOpen = signal(false);
  readonly sending = signal(false);
  readonly orderError = signal<string | null>(null);
  coupon = '';

  constructor(
    private cartService: CartService,
    private ordersService: OrdersService,
    private addressesService: AddressesService,
    private router: Router,
  ) {
    this.cartNotice = this.cartService.cartNotice;
    this.cartItems = this.cartService.cartItems;
    this.itemCount = this.cartService.itemCount;
    this.subtotal = this.cartService.subtotal;
    this.addresses = this.addressesService.addresses;
    this.addressesService.load().catch(() => undefined);
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
    this.selectedAddressId.set(address.id ?? null);
    this.isAddressMenuOpen.set(false);
  }

  async saveAddress(): Promise<void> {
    if (!this.addressDraft.street.trim() || !this.addressDraft.number.trim()) return;

    try {
      const address = await this.addressesService.create({
        ...this.addressDraft,
        label: this.addressDraft.label.trim() || 'Casa',
      });
      this.selectedAddressId.set(address.id ?? null);
      this.addressDraft = emptyAddress();
      this.showNotice('Endereço salvo com sucesso.');
    } catch (erro) {
      this.orderError.set(mensagemDeErro(erro, 'Não foi possível salvar o endereço.'));
    }
  }

  async finishOrder(): Promise<void> {
    const delivery = this.selectedService() === 'delivery';
    if (delivery && !this.selectedAddress()) {
      this.showNotice('Cadastre um endereço para receber seu pedido.');
      return;
    }

    this.sending.set(true);
    this.orderError.set(null);
    try {
      await this.ordersService.placeOrder(
        this.selectedService(),
        this.selectedPayment(),
        delivery ? (this.selectedAddress()?.id ?? null) : null,
      );
      this.router.navigate(['/pedidos']);
    } catch (erro) {
      this.orderError.set(mensagemDeErro(erro, 'Não foi possível finalizar o pedido. Tente novamente.'));
    } finally {
      this.sending.set(false);
    }
  }

  private showNotice(message: string): void {
    this.cartService.showNotice(message);
    window.setTimeout(() => {
      if (this.cartService.cartNotice() === message) this.cartService.clearNotice();
    }, 5000);
  }
}
