import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ACTIVE_STATUSES, NEXT_STATUS, OrderApi, OrderStatus } from '../models/order.model';

// Só liga em desenvolvimento e com pedidosMock: true. Em produção a flag é ignorada.
const USAR_MOCK =
  !environment.production && 'pedidosMock' in environment && environment.pedidosMock === true;

if (USAR_MOCK) console.info('[mock] Pedidos simulados (pedidosMock: true)');

const MIN = 60_000;

const CLIENTES = {
  voce: { nome: 'Você (teste)', telefone: '(21) 99999-0000' },
  maria: { nome: 'Maria Souza', telefone: '(21) 98888-1111' },
  joao: { nome: 'João Pereira', telefone: null },
};

const ENDERECO = {
  apelido: 'Casa',
  logradouro: 'Rua das Flores',
  numero: '123',
  bairro: 'Centro',
  cidade: 'Cidade Exemplo',
  estado: 'RJ',
};

type ItemMock = [itemId: number, nome: string, tamanho: string | null, qtd: number, preco: number];
interface PedidoMock { meu: boolean; api: OrderApi }

function criar(
  id: number, meu: boolean, cliente: OrderApi['cliente'], tipo: 'entrega' | 'retirada',
  pagamento: string, trajeto: OrderStatus[], minutosAtras: number, itens: ItemMock[],
): PedidoMock {
  const itensApi = itens.map(([item_cardapio_id, nome_item, tamanho_item, quantidade, preco_unitario]) => ({
    item_cardapio_id, nome_item, tamanho_item, quantidade, preco_unitario,
    subtotal: +(quantidade * preco_unitario).toFixed(2),
  }));

  const criado = Date.now() - minutosAtras * MIN;
  const historico = trajeto.map((status, i) => ({
    status_anterior: i === 0 ? null : trajeto[i - 1],
    status_novo: status,
    alterado_em: new Date(Math.min(Date.now(), criado + i * 8 * MIN)).toISOString(),
  }));

  return {
    meu,
    api: {
      id,
      tipo_atendimento: tipo,
      forma_pagamento: pagamento,
      status: trajeto[trajeto.length - 1],
      total: +itensApi.reduce((soma, i) => soma + i.subtotal, 0).toFixed(2),
      criado_em: new Date(criado).toISOString(),
      atualizado_em: historico[historico.length - 1].alterado_em,
      itens_resumo: itensApi.map((i) => `${i.quantidade}x ${i.nome_item}`).join(', '),
      itens: itensApi,
      cliente,
      endereco: tipo === 'entrega' ? ENDERECO : null,
      historico,
    },
  };
}

// Dados em memória: voltam ao estado inicial quando a página é recarregada
const store: PedidoMock[] = [
  criar(1056, true, CLIENTES.voce, 'retirada', 'pix', ['recebido', 'confirmado', 'em_preparo'], 22,
    [[1, 'Combo Frango + Linguiça', 'Padrão (2 Pessoas)', 1, 49.99], [12, 'Refrigerante Cola 2L', null, 1, 14.99]]),
  criar(1055, false, CLIENTES.joao, 'entrega', 'pix', ['recebido', 'confirmado', 'em_preparo', 'saiu_para_entrega'], 48,
    [[3, 'Asas de Frango Crocantes', null, 1, 59.99]]),
  criar(1054, false, CLIENTES.maria, 'entrega', 'dinheiro', ['recebido', 'confirmado', 'em_preparo'], 30,
    [[9, 'Strogonoff de Frango', null, 2, 43.99]]),
  criar(1053, false, CLIENTES.joao, 'retirada', 'cartao', ['recebido', 'confirmado'], 14,
    [[5, 'Frango à Parmegiana', null, 1, 47.99], [13, 'Suco Natural de Laranja', '500ml', 2, 12.99]]),
  criar(1052, false, CLIENTES.maria, 'entrega', 'pix', ['recebido'], 5,
    [[2, 'Frango Grelhado com Salada', null, 1, 49.99]]),
  criar(1048, true, CLIENTES.voce, 'entrega', 'pix', ['recebido', 'confirmado', 'em_preparo', 'saiu_para_entrega', 'entregue'], 4320,
    [[1, 'Combo Frango + Linguiça', 'Família (4 Pessoas)', 1, 74.99]]),
  criar(1037, true, CLIENTES.voce, 'retirada', 'cartao', ['recebido', 'confirmado', 'em_preparo', 'saiu_para_entrega', 'entregue'], 7000,
    [[4, 'Frango à Passarinho', null, 2, 44.99]]),
  criar(1022, true, CLIENTES.voce, 'entrega', 'dinheiro', ['recebido', 'cancelado'], 12000,
    [[6, 'Coxinha da Asa ao Molho Barbecue', null, 1, 42.99]]),
];

// a listagem não traz endereço nem histórico (só o detalhe traz)
function resumo(api: OrderApi): OrderApi {
  const copia = { ...api };
  delete copia.endereco;
  delete copia.historico;
  return copia;
}

function resposta<T>(body: T) {
  return of(new HttpResponse({ status: 200, body })).pipe(delay(300));
}

function erro(status: number, detail: string) {
  return throwError(() => new HttpErrorResponse({ status, error: { detail } }));
}

export const mockPedidosInterceptor: HttpInterceptorFn = (req, next) => {
  if (!USAR_MOCK || !req.url.startsWith(environment.apiUrl)) return next(req);

  const caminho = req.url.slice(environment.apiUrl.length).split('?')[0];

  if (req.method === 'GET' && caminho === '/admin/orders') {
    return resposta(store.map((p) => resumo(p.api)));
  }

  if (req.method === 'GET' && caminho === '/orders') {
    return resposta(store.filter((p) => p.meu).map((p) => resumo(p.api)));
  }

  const detalhe = caminho.match(/^\/admin\/orders\/(\d+)$/);
  if (req.method === 'GET' && detalhe) {
    const alvo = store.find((p) => p.api.id === Number(detalhe[1]));
    return alvo ? resposta(alvo.api) : erro(404, 'Pedido não encontrado');
  }

  const mudanca = caminho.match(/^\/admin\/orders\/(\d+)\/status$/);
  if (req.method === 'PATCH' && mudanca) {
    const alvo = store.find((p) => p.api.id === Number(mudanca[1]));
    if (!alvo) return erro(404, 'Pedido não encontrado');

    const atual = alvo.api.status;
    const novo = (req.body as { status: OrderStatus }).status;
    const permitido =
      novo === NEXT_STATUS[atual] || (novo === 'cancelado' && ACTIVE_STATUSES.includes(atual));
    if (!permitido) return erro(422, `Transição inválida: ${atual} → ${novo}`);

    const agora = new Date().toISOString();
    alvo.api.historico = [
      ...(alvo.api.historico ?? []),
      { status_anterior: atual, status_novo: novo, alterado_em: agora },
    ];
    alvo.api.status = novo;
    alvo.api.atualizado_em = agora;
    return resposta(alvo.api);
  }

  return next(req); // qualquer outra chamada segue pro back de verdade
};