import { Component, inject, signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';
import { Order, statusLabel } from '../../shared/models/order.model';
import { OrdersService } from '../../shared/services/orders.service';

@Component({
  selector: 'app-historico-pedidos',
  imports: [
    ...SHARED_IMPORTS,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './historico-pedidos.html',
  styleUrl: './historico-pedidos.scss',
})
export class HistoricoPedidos {
  private readonly ordersService = inject(OrdersService);

  readonly orders = this.ordersService.myOrders;
  readonly loaded = this.ordersService.loaded;
  readonly loadError = signal(false);
  readonly statusLabel = statusLabel;

  constructor() {
    this.ordersService.loadMyOrders().catch(() => this.loadError.set(true));
  }

  // Reaproveita as classes de cor que a tela já tinha
  statusClass(order: Order): string {
    if (order.status === 'entregue') return 'delivered';
    if (order.status === 'cancelado') return 'canceled';
    return 'preparing';
  }

  title(order: Order): string {
    const first = order.items[0]?.name ?? 'Pedido';
    return order.items.length > 1 ? `${first} + ${order.items.length - 1} ${order.items.length === 2 ? 'item' : 'itens'}` : first;
  }
}
