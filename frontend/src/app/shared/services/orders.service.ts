import { Injectable, signal } from '@angular/core';
import { CartItem, CartService } from './cart.service';
import { NotificationsService } from './notifications.service';

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

const ORDER_STORAGE_KEY = 'casa-do-frango-current-orders';
const LEGACY_ORDER_STORAGE_KEY = 'casa-do-frango-current-order';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  readonly currentOrders = signal<CurrentOrder[]>(this.loadOrders());
  readonly successNotice = signal<string | null>(null);

  constructor(
    private cartService: CartService,
    private notificationsService: NotificationsService,
  ) {}

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

    this.currentOrders.update((orders) => [order, ...orders]);
    this.persistOrders();
    this.successNotice.set('Compra finalizada com sucesso!');
    this.notificationsService.addOrderNotification(order.id);
    this.cartService.clear();
    return order;
  }

  clearSuccessNotice(): void {
    this.successNotice.set(null);
  }

  private loadOrders(): CurrentOrder[] {
    const storedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
    const legacyOrder = localStorage.getItem(LEGACY_ORDER_STORAGE_KEY);

    try {
      if (storedOrders) {
        const orders = JSON.parse(storedOrders) as CurrentOrder[];
        return Array.isArray(orders) ? orders : [];
      }

      if (legacyOrder) {
        const order = JSON.parse(legacyOrder) as CurrentOrder;
        return order ? [order] : [];
      }

      return [];
    } catch {
      localStorage.removeItem(ORDER_STORAGE_KEY);
      localStorage.removeItem(LEGACY_ORDER_STORAGE_KEY);
      return [];
    }
  }

  private persistOrders(): void {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(this.currentOrders()));
  }
}
