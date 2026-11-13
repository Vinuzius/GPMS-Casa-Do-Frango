export type OrderStatus =
  | 'recebido'
  | 'confirmado'
  | 'em_preparo'
  | 'saiu_para_entrega'
  | 'entregue'
  | 'cancelado';

export type ServiceType = 'delivery' | 'pickup';
export type PaymentType = 'pix' | 'card' | 'cash';

export interface OrderItem {
  productId: string;
  name: string;
  size: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderAddress {
  label: string | null;
  street: string;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}

export interface OrderHistoryEntry {
  from: OrderStatus | null;
  to: OrderStatus;
  at: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  service: ServiceType;
  payment: PaymentType;
  total: number;
  createdAt: string;
  updatedAt: string;
  itemsSummary: string;
  items: OrderItem[];
  customer: { name: string; phone: string | null } | null;
  address?: OrderAddress | null; // só no detalhe
  history?: OrderHistoryEntry[]; // só no detalhe
}

export const ACTIVE_STATUSES: OrderStatus[] = ['recebido', 'confirmado', 'em_preparo', 'saiu_para_entrega'];
export const FINISHED_STATUSES: OrderStatus[] = ['entregue', 'cancelado'];

// Próxima etapa do fluxo normal (o backend recusa qualquer outro salto)
export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  recebido: 'confirmado',
  confirmado: 'em_preparo',
  em_preparo: 'saiu_para_entrega',
  saiu_para_entrega: 'entregue',
  entregue: null,
  cancelado: null,
};

export function statusLabel(status: OrderStatus, service: ServiceType = 'delivery'): string {
  switch (status) {
    case 'recebido':
      return 'Recebido';
    case 'confirmado':
      return 'Confirmado';
    case 'em_preparo':
      return 'Em preparo';
    case 'saiu_para_entrega':
      return service === 'pickup' ? 'Pronto para retirada' : 'Saiu para entrega';
    case 'entregue':
      return service === 'pickup' ? 'Retirado' : 'Entregue';
    case 'cancelado':
      return 'Cancelado';
  }
}

export const PAYMENT_LABELS: Record<PaymentType, string> = { pix: 'Pix', card: 'Cartão', cash: 'Dinheiro' };

// ---- conversão da API (português) para o modelo das telas ----

export const PAYMENT_TO_API: Record<PaymentType, string> = { pix: 'pix', card: 'cartao', cash: 'dinheiro' };
const PAYMENT_FROM_API: Record<string, PaymentType> = { pix: 'pix', cartao: 'card', dinheiro: 'cash' };

export interface OrderItemApi {
  item_cardapio_id: number;
  nome_item: string;
  tamanho_item: string | null;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface OrderApi {
  id: number;
  tipo_atendimento: 'entrega' | 'retirada';
  forma_pagamento: string;
  status: OrderStatus;
  total: number;
  criado_em: string;
  atualizado_em: string;
  itens_resumo: string | null;
  itens: OrderItemApi[];
  cliente: { nome: string; telefone: string | null } | null;
  endereco?: {
    apelido: string | null;
    logradouro: string;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
  } | null;
  historico?: { status_anterior: OrderStatus | null; status_novo: OrderStatus; alterado_em: string }[];
}

export function fromApiOrder(order: OrderApi): Order {
  return {
    id: order.id,
    status: order.status,
    service: order.tipo_atendimento === 'retirada' ? 'pickup' : 'delivery',
    payment: PAYMENT_FROM_API[order.forma_pagamento] ?? 'cash',
    total: order.total,
    createdAt: order.criado_em,
    updatedAt: order.atualizado_em,
    itemsSummary: order.itens_resumo ?? '',
    items: (order.itens ?? []).map((item) => ({
      productId: String(item.item_cardapio_id),
      name: item.nome_item,
      size: item.tamanho_item,
      quantity: item.quantidade,
      unitPrice: item.preco_unitario,
      subtotal: item.subtotal,
    })),
    customer: order.cliente ? { name: order.cliente.nome, phone: order.cliente.telefone } : null,
    address: order.endereco
      ? {
          label: order.endereco.apelido,
          street: order.endereco.logradouro,
          number: order.endereco.numero,
          neighborhood: order.endereco.bairro,
          city: order.endereco.cidade,
          state: order.endereco.estado,
        }
      : null,
    history: order.historico?.map((h) => ({ from: h.status_anterior, to: h.status_novo, at: h.alterado_em })),
  };
}
