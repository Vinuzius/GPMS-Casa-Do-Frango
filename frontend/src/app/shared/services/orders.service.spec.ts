import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { CartService } from './cart.service';
import { OrdersService } from './orders.service';

const API = environment.apiUrl;

const COMBO: Product = {
  id: '1',
  name: 'Combo Frango',
  description: '',
  categoryIds: ['refeicoes'],
  price: 49.99,
  imageUrl: '',
  sizes: [
    { label: 'Padrão', priceModifier: 0 },
    { label: 'Família', priceModifier: 25 },
  ],
};

function pedidoApi(overrides: object = {}) {
  return {
    id: 1001,
    tipo_atendimento: 'retirada',
    forma_pagamento: 'cartao',
    status: 'recebido',
    total: 149.97,
    criado_em: '2026-11-12T20:00:00Z',
    atualizado_em: '2026-11-12T20:00:00Z',
    itens_resumo: 'Combo Frango (Família) (2x)',
    itens: [
      { item_cardapio_id: 1, nome_item: 'Combo Frango', tamanho_item: 'Família', quantidade: 2, preco_unitario: 74.99, subtotal: 149.98 },
    ],
    cliente: null,
    endereco: null,
    ...overrides,
  };
}

describe('OrdersService', () => {
  let service: OrdersService;
  let cart: CartService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrdersService);
    cart = TestBed.inject(CartService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envia o carrinho no formato da API e só limpa o carrinho depois do sucesso', async () => {
    cart.add(COMBO, COMBO.sizes![1], 2);

    const envio = service.placeOrder('pickup', 'card', 7);
    const req = http.expectOne(`${API}/orders`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      tipo_atendimento: 'retirada',
      endereco_id: null,
      forma_pagamento: 'cartao',
      itens: [{ item_cardapio_id: 1, quantidade: 2, tamanho: 'Família' }],
    });
    expect(cart.cartItems().length).toBe(1);

    req.flush(pedidoApi());
    const pedido = await envio;

    expect(pedido).toMatchObject({ id: 1001, service: 'pickup', payment: 'card', status: 'recebido' });
    expect(pedido.items[0]).toMatchObject({ productId: '1', size: 'Família', quantity: 2 });
    expect(cart.cartItems()).toEqual([]);
    expect(service.currentOrders().map((o) => o.id)).toEqual([1001]);
  });

  it('mantém o carrinho quando a API recusa o pedido', async () => {
    cart.add(COMBO, undefined, 1);

    const envio = service.placeOrder('delivery', 'pix', 3);
    const req = http.expectOne(`${API}/orders`);
    expect(req.request.body).toMatchObject({ tipo_atendimento: 'entrega', endereco_id: 3, forma_pagamento: 'pix' });
    req.flush({ detail: 'Endereço de entrega não encontrado.' }, { status: 404, statusText: 'Not Found' });

    await expect(envio).rejects.toBeTruthy();
    expect(cart.cartItems().length).toBe(1);
  });

  it('separa pedidos em andamento dos finalizados', async () => {
    const carga = service.loadMyOrders();
    http.expectOne(`${API}/orders?limit=100`).flush([
      pedidoApi({ id: 1003, status: 'em_preparo' }),
      pedidoApi({ id: 1002, status: 'entregue' }),
      pedidoApi({ id: 1001, status: 'cancelado' }),
    ]);
    await carga;

    expect(service.currentOrders().map((o) => o.id)).toEqual([1003]);
    expect(service.pastOrders().map((o) => o.id)).toEqual([1002, 1001]);
  });
});
