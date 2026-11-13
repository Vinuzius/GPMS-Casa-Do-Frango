import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PedidosService } from '../../../../shared/services/pedidos.service';
import {
  FORMA_PAGAMENTO_LABEL, PedidoCompleto, STATUS_LABEL, STATUS_LIST, StatusPedido,
} from '../../../../shared/models/pedido.model';

// ignora maiúsculas e acentos na busca
function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

@Component({
  selector: 'app-pedidos-index',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './pedidos-index.html',
  styleUrl: './pedidos-index.scss',
})
export class PedidosIndex implements OnInit {
  private readonly pedidosService = inject(PedidosService);

  readonly usandoMock = this.pedidosService.usandoMock;
  readonly motivoMock = this.pedidosService.motivoMock;
  readonly statusList = STATUS_LIST;
  readonly statusLabel = STATUS_LABEL;
  readonly pagamentoLabel = FORMA_PAGAMENTO_LABEL;
  readonly itensPorPagina = 8;

  readonly carregando = computed(() => !this.pedidosService.loaded());
  readonly falhou = this.pedidosService.loadFailed;

  readonly filtroStatus = signal<StatusPedido | 'TODOS'>('TODOS');
  readonly termoBusca = signal('');
  readonly pagina = signal(1);
  readonly expandidoId = signal<number | null>(null);
  readonly statusPendente = signal<StatusPedido | null>(null);
  readonly salvandoStatus = signal(false);
  readonly erroStatus = signal<string | null>(null);

  readonly pedidosFiltrados = computed(() => {
    const filtro = this.filtroStatus();
    const termo = normalizar(this.termoBusca().trim().replace(/^#/, ''));

    return this.pedidosService
      .pedidos()
      .filter((p) => filtro === 'TODOS' || p.status === filtro)
      .filter(
        (p) =>
          !termo ||
          String(p.id).includes(termo) ||
          p.itens.some((i) => normalizar(i.nome_item).includes(termo)),
      )
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.pedidosFiltrados().length / this.itensPorPagina)),
  );

  readonly paginaAtual = computed(() => Math.min(this.pagina(), this.totalPaginas()));

  readonly pedidosDaPagina = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.pedidosFiltrados().slice(inicio, inicio + this.itensPorPagina);
  });

  readonly numerosPagina = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i + 1),
  );
  ngOnInit(): void {
    void this.pedidosService.reload();
  }

  recarregar(): void {
    void this.pedidosService.reload();
  }

  buscar(valor: string): void {
    this.termoBusca.set(valor);
    this.pagina.set(1);
  }

  filtrarStatus(status: StatusPedido | 'TODOS'): void {
    this.filtroStatus.set(status);
    this.pagina.set(1);
  }

  irParaPagina(numero: number): void {
    if (numero < 1 || numero > this.totalPaginas()) return;
    this.pagina.set(numero);
  }

  toggle(id: number): void {
    this.expandidoId.update((atual) => (atual === id ? null : id));
    this.statusPendente.set(null);
    this.erroStatus.set(null);
  }

  escolherStatus(pedido: PedidoCompleto, valor: string): void {
    const novo = valor as StatusPedido;
    this.statusPendente.set(novo === pedido.status ? null : novo);
    this.erroStatus.set(null);
  }

  async confirmarStatus(pedido: PedidoCompleto): Promise<void> {
    const novo = this.statusPendente();
    if (!novo || this.salvandoStatus()) return;

    this.salvandoStatus.set(true);
    this.erroStatus.set(null);

    try {
      await this.pedidosService.atualizarStatus(pedido.id, novo);
      this.statusPendente.set(null);
    } catch {
      this.erroStatus.set('Não foi possível atualizar o status. Tente novamente.');
    } finally {
      this.salvandoStatus.set(false);
    }
  }

  cancelarStatus(): void {
    this.statusPendente.set(null);
    this.erroStatus.set(null);
  }
}