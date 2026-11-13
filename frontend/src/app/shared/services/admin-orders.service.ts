import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { fromApiOrder, Order, OrderApi, OrderStatus } from '../models/order.model';

const URL = `${environment.apiUrl}/admin/orders`;

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {
  private readonly http = inject(HttpClient);
  private readonly lista = signal<Order[]>([]);

  readonly orders = this.lista.asReadonly();
  readonly loaded = signal(false);

  async load(): Promise<void> {
    const pedidos = await firstValueFrom(this.http.get<OrderApi[]>(`${URL}?limit=100`));
    this.lista.set(pedidos.map(fromApiOrder));
    this.loaded.set(true);
  }

  async detail(id: number): Promise<Order> {
    return fromApiOrder(await firstValueFrom(this.http.get<OrderApi>(`${URL}/${id}`)));
  }

  async changeStatus(id: number, status: OrderStatus): Promise<Order> {
    const atualizado = fromApiOrder(
      await firstValueFrom(this.http.patch<OrderApi>(`${URL}/${id}/status`, { status })),
    );
    // a resposta é o detalhe; mantém os campos do resumo que a lista já tinha
    this.lista.update((pedidos) =>
      pedidos.map((p) => (p.id === id ? { ...p, ...atualizado, customer: atualizado.customer ?? p.customer } : p)),
    );
    return atualizado;
  }
}
