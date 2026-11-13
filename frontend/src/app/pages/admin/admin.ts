import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BarList, BarRow } from '../../shared/components/charts/bar-list';
import { ColumnChart, ColumnPoint } from '../../shared/components/charts/column-chart';
import { statusLabel } from '../../shared/models/order.model';
import { Dashboard, DashboardPeriod, DashboardService } from '../../shared/services/dashboard.service';
import { mensagemDeErro } from '../../shared/utils/http-error';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const compactMoney = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'tudo', label: 'Tudo' },
];

function plural(n: number, singular: string, pluralForm: string): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

@Component({
  selector: 'app-admin',
  imports: [RouterLink, DatePipe, ColumnChart, BarList],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private readonly dashboardService = inject(DashboardService);

  readonly periods = PERIODS;
  readonly period = signal<DashboardPeriod>('30d');
  readonly dailyMetric = signal<'revenue' | 'orders'>('revenue');
  readonly data = signal<Dashboard | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly money = (value: number) => money.format(value);
  readonly statusLabel = statusLabel;

  readonly dailyPoints = computed<ColumnPoint[]>(() => {
    const revenue = this.dailyMetric() === 'revenue';
    return (this.data()?.byDay ?? []).map((d) => {
      const [, month, day] = d.day.split('-');
      return {
        label: `${day}/${month}`,
        value: revenue ? d.revenue : d.orders,
        valueLabel: revenue ? money.format(d.revenue) : plural(d.orders, 'pedido', 'pedidos'),
      };
    });
  });

  readonly dailyTickFormat = computed(() =>
    this.dailyMetric() === 'revenue' ? (v: number) => compactMoney.format(v) : (v: number) => String(Math.round(v)),
  );

  readonly hourPoints = computed<ColumnPoint[]>(() =>
    (this.data()?.byHour ?? []).map((h) => ({
      label: `${h.hour}h`,
      value: h.orders,
      valueLabel: plural(h.orders, 'pedido', 'pedidos'),
    })),
  );

  readonly countTicks = (v: number) => String(Math.round(v));

  readonly topProducts = computed<BarRow[]>(() =>
    (this.data()?.topProducts ?? []).map((p) => ({
      label: p.name,
      value: p.quantity,
      valueLabel: `${p.quantity} un.`,
      detail: `${p.name}: ${p.quantity} unidades, ${money.format(p.revenue)}`,
    })),
  );

  readonly statusRows = computed<BarRow[]>(() =>
    (this.data()?.byStatus ?? []).map((s) => ({
      label: statusLabel(s.status),
      value: s.orders,
      valueLabel: String(s.orders),
    })),
  );

  readonly paymentRows = computed<BarRow[]>(() =>
    (this.data()?.byPayment ?? []).map((p) => ({
      label: p.method,
      value: p.revenue,
      valueLabel: money.format(p.revenue),
      detail: `${p.method}: ${plural(p.orders, 'pedido', 'pedidos')}`,
    })),
  );

  constructor() {
    this.load();
  }

  selectPeriod(period: DashboardPeriod): void {
    if (period === this.period()) return;
    this.period.set(period);
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.data.set(await this.dashboardService.load(this.period()));
    } catch (erro) {
      this.error.set(mensagemDeErro(erro, 'Não foi possível carregar o dashboard.'));
    } finally {
      this.loading.set(false);
    }
  }
}
