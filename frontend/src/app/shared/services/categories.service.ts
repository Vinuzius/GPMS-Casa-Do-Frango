import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';
import { ProductsService } from './products.service';

interface CategoriaApi {
  id: number;
  slug: string;
  nome: string;
  descricao: string | null;
  ordem: number;
}

type CategoryInput = Omit<Category, 'id'>;

// No front o identificador da categoria é o slug (ex.: "refeicoes").
function fromApi(categoria: CategoriaApi): Category {
  return { id: categoria.slug, name: categoria.nome, description: categoria.descricao ?? '' };
}

function toApi(data: CategoryInput) {
  return { nome: data.name, descricao: data.description ?? null };
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly productsService = inject(ProductsService);
  private readonly lista = signal<Category[]>([]);
  private readonly carregamento = this.carregar();

  ready(): Promise<void> {
    return this.carregamento;
  }

  getAllCategories(): Category[] {
    return this.lista();
  }

  getCategoryById(id: string): Category | undefined {
    return this.lista().find((c) => c.id === id);
  }

  async createCategory(data: CategoryInput): Promise<Category> {
    const criada = fromApi(
      await firstValueFrom(
        this.http.post<CategoriaApi>(`${environment.apiUrl}/admin/categorias`, toApi(data)),
      ),
    );
    this.lista.update((categorias) => [...categorias, criada]);
    return criada;
  }

  async updateCategory(id: string, changes: CategoryInput): Promise<Category> {
    const atualizada = fromApi(
      await firstValueFrom(
        this.http.put<CategoriaApi>(`${environment.apiUrl}/admin/categorias/${id}`, toApi(changes)),
      ),
    );
    this.lista.update((categorias) => categorias.map((c) => (c.id === id ? atualizada : c)));
    return atualizada;
  }

  async deleteCategory(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/admin/categorias/${id}`));
    this.lista.update((categorias) => categorias.filter((c) => c.id !== id));
    await this.productsService.reload(); // os produtos perdem a categoria excluída
  }

  private async carregar(): Promise<void> {
    try {
      const categorias = await firstValueFrom(
        this.http.get<CategoriaApi[]>(`${environment.apiUrl}/cardapio/categorias`),
      );
      this.lista.set(categorias.map(fromApi));
    } catch {
      this.lista.set([]);
    }
  }
}
