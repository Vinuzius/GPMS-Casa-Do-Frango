import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ACTIVE_STATUSES,
  fromApiOrder,
  Order,
  OrderApi,
  PAYMENT_TO_API,
  PaymentType,
  ServiceType,
} from '../models/order.model';
import { CartService } from './cart.service';
import { NotificationsService } from './notifications.service';

const URL = `${environment.apiUrl}/orders`;

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly cartService = inject(CartService);
  private readonly notificationsService = inject(NotificationsService);

  private readonly lista = signal<Order[]>([]);
  readonly myOrders = this.lista.asReadonly();
  readonly loaded = signal(false);
  readonly currentOrders = computed(() => this.lista().filter((o) => ACTIVE_STATUSES.includes(o.status)));
  readonly pastOrders = computed(() => this.lista().filter((o) => !ACTIVE_STATUSES.includes(o.status)));
  readonly successNotice = signal<string | null>(null);

  // Envia o carrinho como pedido; o preço final é calculado pelo backend.
  async placeOrder(service: ServiceType, payment: PaymentType, addressId: number | null): Promise<Order> {
    const items = this.cartService.cartItems();
    const corpo = {
      tipo_atendimento: service === 'pickup' ? 'retirada' : 'entrega',
      endereco_id: service === 'pickup' ? null : addressId,
      forma_pagamento: PAYMENT_TO_API[payment],
      itens: items.map((item) => ({
        item_cardapio_id: Number(item.product.id),
        quantidade: item.quantity,
        tamanho: item.size?.label ?? null,
      })),
    };

    const order = fromApiOrder(await firstValueFrom(this.http.post<OrderApi>(URL, corpo)));
    this.lista.update((orders) => [order, ...orders]);
    this.successNotice.set(`Pedido #${order.id} realizado com sucesso!`);
    this.notificationsService.addOrderNotification(order.id);
    this.cartService.clear();
    return order;
  }

  async loadMyOrders(): Promise<void> {
    const pedidos = await firstValueFrom(this.http.get<OrderApi[]>(`${URL}?limit=100`));
    this.lista.set(pedidos.map(fromApiOrder));
    this.loaded.set(true);
  }

  clearSuccessNotice(): void {
    this.successNotice.set(null);
  }
}
