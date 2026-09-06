import { Injectable, signal } from '@angular/core';
import { CartItem, CartService } from './cart.service';

type ServiceType = 'delivery' | 'pickup';
type PaymentType = 'pix' | 'card';

export interface CurrentOrder {
  id: number;
  items: CartItem[];
  service: ServiceType;
  payment: PaymentType;
  total: number;
  createdAt: string;
}

const ORDER_STORAGE_KEY = 'casa-do-frango-current-order';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  readonly currentOrder = signal<CurrentOrder | null>(this.loadOrder());
  readonly successNotice = signal<string | null>(null);

  constructor(private cartService: CartService) {}

  confirmOrder(service: ServiceType, payment: PaymentType): CurrentOrder | null {
    const items = this.cartService.cartItems();
    if (!items.length) return null;

    const order: CurrentOrder = {
      id: Date.now(),
      items,
      service,
      payment,
      total: this.cartService.subtotal(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
    this.currentOrder.set(order);
    this.successNotice.set('Compra finalizada com sucesso!');
    this.cartService.clear();
    return order;
  }

  clearSuccessNotice(): void {
    this.successNotice.set(null);
  }

  private loadOrder(): CurrentOrder | null {
    const storedOrder = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!storedOrder) return null;

    try {
      return JSON.parse(storedOrder) as CurrentOrder;
    } catch {
      localStorage.removeItem(ORDER_STORAGE_KEY);
      return null;
    }
  }
}
