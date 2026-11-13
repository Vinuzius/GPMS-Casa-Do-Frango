import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  ACTIVE_STATUSES,
  FINISHED_STATUSES,
  NEXT_STATUS,
  Order,
  OrderStatus,
  PAYMENT_LABELS,
  statusLabel,
} from '../../../shared/models/order.model';
import { AdminOrdersService } from '../../../shared/services/admin-orders.service';
import { mensagemDeErro } from '../../../shared/utils/http-error';

const REFRESH_MS = 30_000;
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

@Component({
  selector: 'app-admin-pedidos',
  imports: [RouterLink, DatePipe],
  templateUrl: './admin-pedidos.html',
  styleUrl: './admin-pedidos.scss',
})
export class AdminPedidos {
  private readonly service = inject(AdminOrdersService);

  readonly tab = signal<'active' | 'finished'>('active');
  readonly loaded = this.service.loaded;
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly selected = signal<Order | null>(null);
  readonly now = signal(Date.now());

  readonly statusLabel = statusLabel;
  readonly paymentLabels = PAYMENT_LABELS;
  readonly nextStatus = NEXT_STATUS;
  readonly money = (value: number) => money.format(value);

  readonly columns = computed(() =>
    ACTIVE_STATUSES.map((status) => ({
      status,
      title: status === 'saiu_para_entrega' ? 'Saiu para entrega / Pronto' : statusLabel(status),
      // mais antigos primeiro: são os que estão esperando há mais tempo
      orders: this.service
        .orders()
        .filter((o) => o.status === status)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    })),
  );

  readonly finished = computed(() =>
    this.service.orders().filter((o) => FINISHED_STATUSES.includes(o.status)),
  );

  constructor() {
    this.refresh();
    const timer = window.setInterval(() => this.refresh(), REFRESH_MS);
    inject(DestroyRef).onDestroy(() => window.clearInterval(timer));
  }

  elapsed(order: Order): string {
    const minutes = Math.max(0, Math.round((this.now() - new Date(order.createdAt).getTime()) / 60_000));
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return hours < 24 ? `há ${hours}h${String(minutes % 60).padStart(2, '0')}` : `há ${Math.floor(hours / 24)} d`;
  }

  async advance(order: Order): Promise<void> {
    const next = NEXT_STATUS[order.status];
    if (next) await this.change(order, next);
  }

  async cancel(order: Order): Promise<void> {
    if (!window.confirm(`Cancelar o pedido #${order.id}?`)) return;
    await this.change(order, 'cancelado');
  }

  async open(order: Order): Promise<void> {
    this.selected.set(order);
    try {
      this.selected.set(await this.service.detail(order.id));
    } catch (erro) {
      this.error.set(mensagemDeErro(erro, 'Não foi possível abrir o pedido.'));
    }
  }

  close(): void {
    this.selected.set(null);
  }

  private async change(order: Order, status: OrderStatus): Promise<void> {
    this.busyId.set(order.id);
    this.error.set(null);
    try {
      const updated = await this.service.changeStatus(order.id, status);
      if (this.selected()?.id === order.id) this.selected.set(updated);
    } catch (erro) {
      this.error.set(mensagemDeErro(erro, 'Não foi possível alterar o status.'));
      await this.refresh(); // outra pessoa pode ter mudado o pedido antes
    } finally {
      this.busyId.set(null);
    }
  }

  private async refresh(): Promise<void> {
    this.now.set(Date.now());
    try {
      await this.service.load();
    } catch (erro) {
      this.error.set(mensagemDeErro(erro, 'Não foi possível carregar os pedidos.'));
    }
  }
}
