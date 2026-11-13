import { Component, computed, input } from '@angular/core';

export interface BarRow {
  label: string;
  value: number;
  valueLabel: string; // mostrado na ponta da barra
  detail?: string; // texto secundário (dica e leitores de tela)
}

// Barras horizontais de uma única série: rótulo à esquerda, valor na ponta.
// Como todo valor já aparece escrito, a lista funciona como a própria tabela.
@Component({
  selector: 'app-bar-list',
  template: `
    <ol class="bar-list" [attr.aria-label]="caption()">
      @for (row of rows(); track row.label) {
        <li [attr.title]="row.detail ?? null">
          <span class="bar-label">{{ row.label }}</span>
          <span class="bar-track">
            <span class="bar" [style.width.%]="pct(row.value)"></span>
            <span class="bar-value">{{ row.valueLabel }}</span>
          </span>
          @if (row.detail) {
            <span class="sr-only">{{ row.detail }}</span>
          }
        </li>
      } @empty {
        <li class="empty">{{ emptyText() }}</li>
      }
    </ol>
  `,
  styleUrl: './charts.scss',
})
export class BarList {
  readonly rows = input.required<BarRow[]>();
  readonly caption = input('');
  readonly emptyText = input('Sem dados no período.');

  private readonly max = computed(() => Math.max(0, ...this.rows().map((r) => r.value)));

  pct(value: number): number {
    // deixa espaço para o valor escrito na ponta da barra
    if (!this.max() || value <= 0) return 0; // zero não ganha barra; o valor escrito basta
    return Math.max(1, (value / this.max()) * 78);
  }
}
