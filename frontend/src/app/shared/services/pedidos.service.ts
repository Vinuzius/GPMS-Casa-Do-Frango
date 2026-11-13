import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  PedidoCompleto, PedidoItem, PedidoStatusHistorico, StatusPedido,
} from '../models/pedido.model';
import { MOCK_PEDIDOS } from './pedidos.mock';

// Rota Assumida baseado nas views antigas
const PEDIDOS_URL = `${environment.apiUrl}/admin/pedidos`;

// true = usa o mock como reserva quando a API falha ou não retorna pedidos
const PERMITIR_MOCK = environment.pedidosMock;

// Mesmos campos do model do back; itens/histórico podem não vir na listagem
type PedidoApi = Omit<PedidoCompleto, 'itens' | 'historico'> & {
  itens?: PedidoItem[];
  historico?: PedidoStatusHistorico[];
};

function fromApi(pedido: PedidoApi): PedidoCompleto {
  return {
    ...pedido,
    total: Number(pedido.total),
    itens: (pedido.itens ?? []).map((item) => ({
      ...item,
      preco_unitario: Number(item.preco_unitario),
      subtotal: Number(item.subtotal),
    })),
    historico: pedido.historico ?? [],
  };
}

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly http = inject(HttpClient);
  private readonly lista = signal<PedidoCompleto[]>([]);
  private readonly mockAtivo = signal(false);
  private readonly motivo = signal('');

  private mockIniciado = false;
  private jaCarregouReal = false;

  readonly pedidos = this.lista.asReadonly();
  readonly usandoMock = this.mockAtivo.asReadonly();
  readonly motivoMock = this.motivo.asReadonly();
  readonly loaded = signal(false);
  readonly loadFailed = signal(false);

  async reload(): Promise<void> {
    try {
      const pedidos = await firstValueFrom(this.http.get<PedidoApi[]>(PEDIDOS_URL));

      if (pedidos.length === 0 && PERMITIR_MOCK && !this.jaCarregouReal) {
        this.usarMock('a API não retornou pedidos');
      } else {
        this.lista.set(pedidos.map(fromApi));
        this.mockAtivo.set(false);
        this.jaCarregouReal = true;
        this.loadFailed.set(false);
      }
    } catch (erro) {
      if (PERMITIR_MOCK && !this.jaCarregouReal) {
        const status = erro instanceof HttpErrorResponse && erro.status ? erro.status : 'sem resposta';
        this.usarMock(`API indisponível (${status})`);
      } else {
        this.loadFailed.set(true);
      }
    } finally {
      this.loaded.set(true);
    }
  }

  // Só altera a tela se a API confirmar; em caso de erro a exceção sobe pro componente
  async atualizarStatus(id: number, status: StatusPedido): Promise<void> {
    if (this.mockAtivo()) {
      this.atualizarStatusMock(id, status);
      return;
    }

    await firstValueFrom(this.http.patch<unknown>(`${PEDIDOS_URL}/${id}/status`, { status }));
    await this.reload();
  }

  private usarMock(motivo: string): void {
    // Semeia só na primeira vez, pra trocas de status feitas na sessão
    // não serem desfeitas quando a tela for reaberta
    if (!this.mockIniciado) {
      this.lista.set(MOCK_PEDIDOS);
      this.mockIniciado = true;
    }
    this.mockAtivo.set(true);
    this.motivo.set(motivo);
    this.loadFailed.set(false);
  }

  private atualizarStatusMock(id: number, novoStatus: StatusPedido): void {
    const agora = new Date().toISOString();

    this.lista.update((lista) =>
      lista.map((p) => {
        if (p.id !== id || p.status === novoStatus) return p;

        const registro: PedidoStatusHistorico = {
          id: Date.now(), pedido_id: id, status_anterior: p.status,
          status_novo: novoStatus, alterado_por: null, alterado_em: agora,
        };
        return { ...p, status: novoStatus, atualizado_em: agora, historico: [...p.historico, registro] };
      }),
    );
  }
}