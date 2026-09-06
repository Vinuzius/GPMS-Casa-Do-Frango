import { Component, Signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';
import { OrdersService } from '../../shared/services/orders.service';

@Component({
  selector: 'app-pedidos-andamento',
  imports: [...SHARED_IMPORTS, ...MATERIAL_IMPORTS],
  templateUrl: './pedidos-andamento.html',
  styleUrl: './pedidos-andamento.scss',
})
export class PedidosAndamento {
  readonly orders;
  readonly successNotice: Signal<string | null>;

  constructor(ordersService: OrdersService) {
    this.orders = ordersService.currentOrders;
    this.successNotice = ordersService.successNotice;
    if (this.successNotice()) window.setTimeout(() => ordersService.clearSuccessNotice(), 5000);
  }
}
