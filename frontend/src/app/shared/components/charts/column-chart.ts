import { Component, computed, input } from '@angular/core';

export interface ColumnPoint {
  label: string; // rótulo do eixo X (ex.: "05/11", "18h")
  value: number;
  valueLabel: string; // valor formatado para tooltip e tabela
}

// Colunas verticais de uma única série, com dica ao passar o mouse/foco
// e tabela equivalente para leitores de tela.
@Component({
  selector: 'app-column-chart',
  template: `
    <div class="chart">
      <div class="plot" aria-hidden="true">
        @for (tick of ticks(); track tick.value) {
          <div class="gridline" [style.bottom.%]="tick.pct">
            <span>{{ tick.label }}</span>
          </div>
        }
        <div class="columns">
          @for (point of points(); track $index) {
            <div class="slot" tabindex="0">
              <div class="column" [style.height.%]="pct(point.value)"></div>
              <div class="tip"><strong>{{ point.valueLabel }}</strong><span>{{ point.label }}</span></div>
            </div>
          }
        </div>
      </div>
      <div class="x-labels" aria-hidden="true">
        @for (point of points(); track $index) {
          <span>{{ $index % labelStep() === 0 ? point.label : '' }}</span>
        }
      </div>
      <table class="sr-only">
        <caption>{{ caption() }}</caption>
        <tbody>
          @for (point of points(); track $index) {
            <tr><th scope="row">{{ point.label }}</th><td>{{ point.valueLabel }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './charts.scss',
})
export class ColumnChart {
  readonly points = input.required<ColumnPoint[]>();
  readonly caption = input('');
  readonly tickFormat = input<(value: number) => string>((v) => String(v));

  private readonly niceMax = computed(() => niceCeiling(Math.max(0, ...this.points().map((p) => p.value))));

  readonly ticks = computed(() => {
    const max = this.niceMax();
    if (!max) return [{ value: 0, pct: 0, label: this.tickFormat()(0) }];
    const ticks = [0, 0.5, 1].map((f) => ({ value: max * f, pct: f * 100, label: this.tickFormat()(max * f) }));
    // com escalas pequenas (ex.: 0 a 1 pedido) o tick do meio repetiria um rótulo;
    // mantém o de cima, que fica na altura certa do valor
    return ticks.filter((tick, i) => !ticks.slice(i + 1).some((t) => t.label === tick.label));
  });

  // No máximo ~8 rótulos no eixo X
  readonly labelStep = computed(() => Math.max(1, Math.ceil(this.points().length / 8)));

  pct(value: number): number {
    const max = this.niceMax();
    return max ? (value / max) * 100 : 0;
  }
}

// Arredonda para um valor "redondo" (1, 2, 5 × 10^n) para o eixo
export function niceCeiling(value: number): number {
  if (value <= 0) return 0;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}
