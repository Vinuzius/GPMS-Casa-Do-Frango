import { Injectable, signal } from '@angular/core';
import {
  FormaPagamento, PedidoCompleto, PedidoItem, PedidoStatusHistorico, StatusPedido,
} from '../models/pedido.model';

const ADMIN_ID = '99999999-9999-4999-8999-999999999999';
const CLIENTES = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
];

let nextItemId = 1;
let nextHistId = 1;

function item(pedidoId: number, itemId: number, nome: string, categoria: string, qtd: number, preco: number): PedidoItem {
  return {
    id: nextItemId++, pedido_id: pedidoId, item_cardapio_id: itemId, nome_item: nome,
    categoria_item: categoria, quantidade: qtd, preco_unitario: preco,
    subtotal: +(qtd * preco).toFixed(2),
  };
}

// "trajeto" é a sequência de status pela qual o pedido já passou
function pedido(
  id: number, cliente: string, forma: FormaPagamento, criadoEm: string,
  trajeto: StatusPedido[], itens: PedidoItem[],
): PedidoCompleto {
  const base = Date.parse(criadoEm);
  const historico: PedidoStatusHistorico[] = trajeto.map((s, i) => ({
    id: nextHistId++, pedido_id: id,
    status_anterior: i === 0 ? null : trajeto[i - 1],
    status_novo: s,
    alterado_por: i === 0 ? null : ADMIN_ID,
    alterado_em: new Date(base + i * 10 * 60000).toISOString(),
  }));
  return {
    id, usuario_id: cliente, endereco_id: 1, forma_pagamento: forma,
    status: trajeto[trajeto.length - 1],
    total: +itens.reduce((soma, i) => soma + i.subtotal, 0).toFixed(2),
    criado_em: criadoEm,
    atualizado_em: historico[historico.length - 1].alterado_em,
    itens, historico,
  };
}

const MOCK_PEDIDOS: PedidoCompleto[] = [
  pedido(1, CLIENTES[0], 'PIX', '2026-11-10T18:30:00Z',
    ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE'],
    [item(1, 1, 'Combo Frango + Linguiça', 'Refeições', 2, 49.99), item(1, 12, 'Refrigerante Cola 2L', 'Bebidas', 1, 14.99)]),
  pedido(2, CLIENTES[1], 'DINHEIRO', '2026-11-11T12:10:00Z',
    ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE'],
    [item(2, 3, 'Asas de Frango Crocantes', 'Refeições', 1, 59.99)]),
  pedido(3, CLIENTES[2], 'CARTAO', '2026-11-11T19:45:00Z',
    ['RECEBIDO', 'CANCELADO'],
    [item(3, 5, 'Frango à Parmegiana', 'Refeições', 1, 47.99)]),
  pedido(4, CLIENTES[0], 'PIX', '2026-11-12T11:50:00Z',
    ['RECEBIDO', 'EM_PREPARO'],
    [item(4, 1, 'Combo Frango + Linguiça', 'Refeições', 1, 49.99), item(4, 13, 'Suco Natural de Laranja', 'Bebidas', 2, 9.99)]),
  pedido(5, CLIENTES[1], 'DINHEIRO', '2026-11-12T12:20:00Z',
    ['RECEBIDO'],
    [item(5, 9, 'Strogonoff de Frango', 'Refeições', 2, 43.99)]),
  pedido(6, CLIENTES[2], 'PIX', '2026-11-12T12:35:00Z',
    ['RECEBIDO'],
    [item(6, 2, 'Frango Grelhado com Salada', 'Refeições', 1, 49.99), item(6, 14, 'Água Mineral 500ml', 'Bebidas', 1, 4.99)]),
];

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly _pedidos = signal<PedidoCompleto[]>(MOCK_PEDIDOS);
  readonly pedidos = this._pedidos.asReadonly();

  atualizarStatus(id: number, novoStatus: StatusPedido): void {
    const agora = new Date().toISOString();

    this._pedidos.update((lista) =>
      lista.map((p) => {
        if (p.id !== id || p.status === novoStatus) return p;

        const registro: PedidoStatusHistorico = {
          id: nextHistId++, pedido_id: id, status_anterior: p.status,
          status_novo: novoStatus, alterado_por: null, // vira o id do admin logado quando houver auth no back
          alterado_em: agora,
        };
        return { ...p, status: novoStatus, atualizado_em: agora, historico: [...p.historico, registro] };
      }),
    );
  }
}