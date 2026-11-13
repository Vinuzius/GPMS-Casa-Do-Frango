import { Component, DestroyRef, inject, signal, Signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';
import { Order, OrderStatus, PAYMENT_LABELS, statusLabel } from '../../shared/models/order.model';
import { OrdersService } from '../../shared/services/orders.service';
import { ProductsService } from '../../shared/services/products.service';

interface TrackingStep {
  label: string;
  icon: string;
}

// Posição de cada status na barra de 4 etapas
const STEP_INDEX: Record<OrderStatus, number> = {
  recebido: 0,
  confirmado: 1,
  em_preparo: 1,
  saiu_para_entrega: 2,
  entregue: 3,
  cancelado: 0,
};

const REFRESH_MS = 30_000;

@Component({
  selector: 'app-pedidos-andamento',
  imports: [...SHARED_IMPORTS, ...MATERIAL_IMPORTS],
  templateUrl: './pedidos-andamento.html',
  styleUrl: './pedidos-andamento.scss',
})
export class PedidosAndamento {
  private readonly ordersService = inject(OrdersService);
  private readonly productsService = inject(ProductsService);

  readonly orders = this.ordersService.currentOrders;
  readonly loaded = this.ordersService.loaded;
  readonly loadError = signal(false);
  readonly successNotice: Signal<string | null> = this.ordersService.successNotice;
  readonly statusLabel = statusLabel;
  readonly paymentLabels = PAYMENT_LABELS;

  constructor() {
    if (this.successNotice()) window.setTimeout(() => this.ordersService.clearSuccessNotice(), 5000);

    this.refresh();
    const timer = window.setInterval(() => this.refresh(), REFRESH_MS);
    inject(DestroyRef).onDestroy(() => window.clearInterval(timer));
  }

  steps(order: Order): TrackingStep[] {
    const pickup = order.service === 'pickup';
    return [
      { label: 'Recebido', icon: 'check' },
      { label: 'Em preparação', icon: 'soup_kitchen' },
      { label: pickup ? 'Pronto para retirada' : 'A caminho', icon: pickup ? 'storefront' : 'two_wheeler' },
      { label: pickup ? 'Retirado' : 'Entregue', icon: 'home' },
    ];
  }

  stepIndex(order: Order): number {
    return STEP_INDEX[order.status];
  }

  imageFor(productId: string): string {
    return this.productsService.getProductById(productId)?.imageUrl ?? '';
  }

  private async refresh(): Promise<void> {
    try {
      await this.ordersService.loadMyOrders();
      this.loadError.set(false);
    } catch {
      this.loadError.set(true);
    }
  }
}
