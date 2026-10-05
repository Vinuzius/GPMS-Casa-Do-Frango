import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Product, ProductInput } from '../models/product.model';

interface ProdutoApi {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem_url: string | null;
  ativo: boolean;
  categorias: string[];
  tamanhos: { rotulo: string; acrescimo: number }[];
}

const DRINKS_CATEGORY = 'bebidas';

function fromApi(produto: ProdutoApi): Product {
  return {
    id: String(produto.id),
    name: produto.nome,
    description: produto.descricao ?? '',
    categoryIds: produto.categorias,
    price: produto.preco,
    imageUrl: produto.imagem_url ?? '',
    isDrink: produto.categorias.includes(DRINKS_CATEGORY),
    available: produto.ativo,
    sizes: produto.tamanhos.map((t) => ({ label: t.rotulo, priceModifier: t.acrescimo })),
  };
}

function toApi(data: ProductInput) {
  return {
    nome: data.name,
    descricao: data.description,
    preco: data.price,
    imagem_url: data.imageUrl,
    ativo: data.available !== false,
    categorias: data.categoryIds,
    tamanhos: (data.sizes ?? [])
      .filter((size) => size.label.trim())
      .map((size) => ({ rotulo: size.label, acrescimo: size.priceModifier ?? 0 })),
  };
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly lista = signal<Product[]>([]);

  readonly loaded = signal(false);
  readonly loadFailed = signal(false);

  private readonly carregamento = this.reload();

  ready(): Promise<void> {
    return this.carregamento;
  }

  async reload(): Promise<void> {
    try {
      const produtos = await firstValueFrom(
        this.http.get<ProdutoApi[]>(`${environment.apiUrl}/cardapio/produtos`),
      );
      this.lista.set(produtos.map(fromApi));
      this.loadFailed.set(false);
    } catch {
      this.loadFailed.set(true);
    } finally {
      this.loaded.set(true);
    }
  }

  getAllProducts(): Product[] {
    return this.lista();
  }

  getProductsByCategory(categoryId: string): Product[] {
    return this.lista().filter((p) => p.categoryIds.includes(categoryId));
  }

  getProductById(id: string): Product | undefined {
    return this.lista().find((p) => p.id === id);
  }

  async createProduct(data: ProductInput): Promise<Product> {
    const criado = fromApi(
      await firstValueFrom(
        this.http.post<ProdutoApi>(`${environment.apiUrl}/admin/produtos`, toApi(data)),
      ),
    );
    this.lista.update((produtos) => [...produtos, criado]);
    return criado;
  }

  async updateProduct(id: string, changes: ProductInput): Promise<Product> {
    const atualizado = fromApi(
      await firstValueFrom(
        this.http.put<ProdutoApi>(`${environment.apiUrl}/admin/produtos/${id}`, toApi(changes)),
      ),
    );
    this.lista.update((produtos) => produtos.map((p) => (p.id === id ? atualizado : p)));
    return atualizado;
  }

  async deleteProduct(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/admin/produtos/${id}`));
    this.lista.update((produtos) => produtos.filter((p) => p.id !== id));
  }
}
