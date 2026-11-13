import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { fromApiOrder, Order, OrderApi, OrderStatus } from '../models/order.model';

export type DashboardPeriod = 'hoje' | '7d' | '30d' | 'tudo';

interface DashboardApi {
  periodo: DashboardPeriod;
  indicadores: {
    faturamento_realizado: number;
    faturamento_estimado: number;
    total_pedidos: number;
    ticket_medio: number;
    em_andamento_agora: number;
    cancelados: number;
    percentual_cancelados: number;
  };
  por_dia: { dia: string; pedidos: number; faturamento: number }[];
  mais_pedidos: { produto_id: number; nome: string; imagem_url: string | null; quantidade: number; faturamento: number }[];
  por_status: { status: OrderStatus; pedidos: number }[];
  por_pagamento: { forma_pagamento: string; pedidos: number; faturamento: number }[];
  por_hora: { hora: number; pedidos: number }[];
  ultimos_pedidos: OrderApi[];
}

export interface Dashboard {
  period: DashboardPeriod;
  kpis: {
    realizedRevenue: number;
    estimatedRevenue: number;
    totalOrders: number;
    averageTicket: number;
    inProgressNow: number;
    canceled: number;
    canceledPercent: number;
  };
  byDay: { day: string; orders: number; revenue: number }[];
  topProducts: { productId: string; name: string; imageUrl: string | null; quantity: number; revenue: number }[];
  byStatus: { status: OrderStatus; orders: number }[];
  byPayment: { method: string; orders: number; revenue: number }[];
  byHour: { hour: number; orders: number }[];
  latestOrders: Order[];
}

const PAYMENT_NAMES: Record<string, string> = { pix: 'Pix', cartao: 'Cartão', dinheiro: 'Dinheiro' };

function fromApi(d: DashboardApi): Dashboard {
  const i = d.indicadores;
  return {
    period: d.periodo,
    kpis: {
      realizedRevenue: i.faturamento_realizado,
      estimatedRevenue: i.faturamento_estimado,
      totalOrders: i.total_pedidos,
      averageTicket: i.ticket_medio,
      inProgressNow: i.em_andamento_agora,
      canceled: i.cancelados,
      canceledPercent: i.percentual_cancelados,
    },
    byDay: d.por_dia.map((p) => ({ day: p.dia, orders: p.pedidos, revenue: p.faturamento })),
    topProducts: d.mais_pedidos.map((p) => ({
      productId: String(p.produto_id),
      name: p.nome,
      imageUrl: p.imagem_url,
      quantity: p.quantidade,
      revenue: p.faturamento,
    })),
    byStatus: d.por_status.map((s) => ({ status: s.status, orders: s.pedidos })),
    byPayment: d.por_pagamento.map((p) => ({
      method: PAYMENT_NAMES[p.forma_pagamento] ?? p.forma_pagamento,
      orders: p.pedidos,
      revenue: p.faturamento,
    })),
    byHour: d.por_hora.map((h) => ({ hour: h.hora, orders: h.pedidos })),
    latestOrders: d.ultimos_pedidos.map(fromApiOrder),
  };
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  async load(period: DashboardPeriod): Promise<Dashboard> {
    return fromApi(
      await firstValueFrom(
        this.http.get<DashboardApi>(`${environment.apiUrl}/admin/dashboard?periodo=${period}`),
      ),
    );
  }
}
