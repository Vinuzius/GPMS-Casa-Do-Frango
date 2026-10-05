import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { ProductsService } from './products.service';

const API = environment.apiUrl;

const PRODUTOS_API = [
  {
    id: 1,
    nome: 'Combo Frango',
    descricao: 'Frango e linguiça',
    preco: 49.99,
    imagem_url: 'http://img/combo.png',
    ativo: true,
    categorias: ['refeicoes'],
    tamanhos: [
      { rotulo: 'Padrão', acrescimo: 0 },
      { rotulo: 'Família', acrescimo: 25 },
    ],
  },
  {
    id: 2,
    nome: 'Suco',
    descricao: null,
    preco: 8,
    imagem_url: null,
    ativo: false,
    categorias: ['bebidas'],
    tamanhos: [],
  },
];

describe('ProductsService', () => {
  let service: ProductsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function carregar(): Promise<void> {
    http.expectOne(`${API}/cardapio/produtos`).flush(PRODUTOS_API);
    await service.ready();
  }

  it('converte os produtos da API para o modelo das telas', async () => {
    await carregar();

    expect(service.getProductById('1')).toEqual({
      id: '1',
      name: 'Combo Frango',
      description: 'Frango e linguiça',
      categoryIds: ['refeicoes'],
      price: 49.99,
      imageUrl: 'http://img/combo.png',
      isDrink: false,
      available: true,
      sizes: [
        { label: 'Padrão', priceModifier: 0 },
        { label: 'Família', priceModifier: 25 },
      ],
    });
    expect(service.getProductById('2')).toMatchObject({ isDrink: true, available: false, imageUrl: '' });
    expect(service.getProductsByCategory('bebidas').map((p) => p.id)).toEqual(['2']);
    expect(service.loaded()).toBe(true);
    expect(service.loadFailed()).toBe(false);
  });

  it('sinaliza falha quando a API não responde', async () => {
    http.expectOne(`${API}/cardapio/produtos`).error(new ProgressEvent('error'));
    await service.ready();

    expect(service.getAllProducts()).toEqual([]);
    expect(service.loaded()).toBe(true);
    expect(service.loadFailed()).toBe(true);
  });

  it('cria o produto pela API, sem tamanhos em branco, e inclui na lista', async () => {
    await carregar();

    const criacao = service.createProduct({
      name: 'Asinha',
      description: 'Crocante',
      categoryIds: ['refeicoes', 'aperitivos'],
      price: 30,
      imageUrl: 'http://img/asa.png',
      available: true,
      sizes: [
        { label: 'G', priceModifier: 10 },
        { label: '   ', priceModifier: 0 },
      ],
    });

    const req = http.expectOne(`${API}/admin/produtos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nome: 'Asinha',
      descricao: 'Crocante',
      preco: 30,
      imagem_url: 'http://img/asa.png',
      ativo: true,
      categorias: ['refeicoes', 'aperitivos'],
      tamanhos: [{ rotulo: 'G', acrescimo: 10 }],
    });
    req.flush({ ...PRODUTOS_API[0], id: 3, nome: 'Asinha' });

    expect((await criacao).id).toBe('3');
    expect(service.getAllProducts().map((p) => p.id)).toEqual(['1', '2', '3']);
  });

  it('atualiza e remove produtos da lista local', async () => {
    await carregar();

    const edicao = service.updateProduct('1', {
      name: 'Combo Novo',
      description: '',
      categoryIds: [],
      price: 10,
      imageUrl: '',
    });
    const put = http.expectOne(`${API}/admin/produtos/1`);
    expect(put.request.method).toBe('PUT');
    put.flush({ ...PRODUTOS_API[0], nome: 'Combo Novo' });
    await edicao;
    expect(service.getProductById('1')?.name).toBe('Combo Novo');

    const exclusao = service.deleteProduct('2');
    http.expectOne({ url: `${API}/admin/produtos/2`, method: 'DELETE' }).flush(null);
    await exclusao;
    expect(service.getAllProducts().map((p) => p.id)).toEqual(['1']);
  });
});
