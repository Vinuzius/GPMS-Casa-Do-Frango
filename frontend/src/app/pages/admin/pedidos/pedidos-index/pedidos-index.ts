import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PedidosService } from '../../../../shared/services/pedidos.service';
import {
  FORMA_PAGAMENTO_LABEL, PedidoCompleto, STATUS_LABEL, STATUS_LIST, StatusPedido,
} from '../../../../shared/models/pedido.model';

@Component({
  selector: 'app-pedidos-index',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './pedidos-index.html',
  styleUrl: './pedidos-index.scss',
})
export class PedidosIndex {
  private readonly pedidosService = inject(PedidosService);

  readonly statusList = STATUS_LIST;
  readonly statusLabel = STATUS_LABEL;
  readonly pagamentoLabel = FORMA_PAGAMENTO_LABEL;

  readonly filtroStatus = signal<StatusPedido | 'TODOS'>('TODOS');
  readonly expandidoId = signal<number | null>(null);

  readonly pedidosFiltrados = computed(() => {
    const filtro = this.filtroStatus();
    return this.pedidosService
      .pedidos()
      .filter((p) => filtro === 'TODOS' || p.status === filtro)
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  });

  toggle(id: number): void {
    this.expandidoId.update((atual) => (atual === id ? null : id));
  }

  mudarStatus(pedido: PedidoCompleto, valor: string): void {
    this.pedidosService.atualizarStatus(pedido.id, valor as StatusPedido);
  }
}