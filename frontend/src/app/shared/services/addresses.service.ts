import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Address } from '../models/address.model';

interface EnderecoApi {
  id: number;
  apelido: string | null;
  logradouro: string;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  is_padrao: boolean;
}

function fromApi(e: EnderecoApi): Address {
  return {
    id: e.id,
    label: e.apelido ?? 'Endereço',
    isPrimary: e.is_padrao,
    street: e.logradouro,
    number: e.numero ?? '',
    complement: e.complemento ?? '',
    neighborhood: e.bairro ?? '',
    city: e.cidade ?? '',
    state: e.estado ?? '',
    zipCode: e.cep ?? '',
  };
}

function toApi(a: Address) {
  return {
    apelido: a.label,
    logradouro: a.street,
    numero: a.number,
    complemento: a.complement ?? null,
    bairro: a.neighborhood,
    cidade: a.city,
    estado: a.state,
    cep: a.zipCode,
  };
}

const URL = `${environment.apiUrl}/enderecos`;

@Injectable({ providedIn: 'root' })
export class AddressesService {
  private readonly http = inject(HttpClient);
  private readonly lista = signal<Address[]>([]);

  readonly addresses = this.lista.asReadonly();
  readonly loaded = signal(false);

  async load(): Promise<void> {
    const enderecos = await firstValueFrom(this.http.get<EnderecoApi[]>(URL));
    this.lista.set(enderecos.map(fromApi));
    this.loaded.set(true);
  }

  async create(address: Address): Promise<Address> {
    const criado = fromApi(await firstValueFrom(this.http.post<EnderecoApi>(URL, toApi(address))));
    this.lista.update((lista) => [...lista, criado]);
    return criado;
  }

  async update(address: Address): Promise<Address> {
    const atualizado = fromApi(await firstValueFrom(this.http.put<EnderecoApi>(`${URL}/${address.id}`, toApi(address))));
    this.lista.update((lista) => lista.map((a) => (a.id === atualizado.id ? atualizado : a)));
    return atualizado;
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${URL}/${id}`));
    await this.load(); // o backend pode ter promovido outro endereço a principal
  }

  async makePrimary(id: number): Promise<void> {
    await firstValueFrom(this.http.patch<EnderecoApi>(`${URL}/${id}/padrao`, {}));
    this.lista.update((lista) => lista.map((a) => ({ ...a, isPrimary: a.id === id })));
  }
}
