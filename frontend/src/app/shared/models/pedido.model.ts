// checar enum.py
export type StatusPedido = 'RECEBIDO' | 'CONFIRMADO' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO';
export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'CARTAO';

export const STATUS_LABEL: Record<StatusPedido, string> = {
  RECEBIDO: 'Recebido',
  CONFIRMADO: 'Confirmado',
  EM_PREPARO: 'Em preparo',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  CARTAO: 'Cartão',
};

export const STATUS_LIST = Object.keys(STATUS_LABEL) as StatusPedido[];

export interface Pedido {
  id: number;
  usuario_id: string;
  endereco_id: number;
  forma_pagamento: FormaPagamento;
  status: StatusPedido;
  total: number;
  criado_em: string; // ISO
  atualizado_em: string;
}

export interface PedidoItem {
  id: number;
  pedido_id: number;
  item_cardapio_id: number;
  nome_item: string;
  categoria_item: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface PedidoStatusHistorico {
  id: number;
  pedido_id: number;
  status_anterior: StatusPedido | null;
  status_novo: StatusPedido;
  alterado_por: string | null;
  alterado_em: string;
}

// O back separa pedido/itens/histórico; na tela eu junto tudo num objeto só
export interface PedidoCompleto extends Pedido {
  itens: PedidoItem[];
  historico: PedidoStatusHistorico[];
}