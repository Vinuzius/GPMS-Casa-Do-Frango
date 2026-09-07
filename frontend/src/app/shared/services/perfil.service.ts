import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface Perfil {
  id: string;
  nome: string;
  telefone: string | null;
  is_admin: boolean;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  readonly perfil = signal<Perfil | null>(null);

  constructor(private http: HttpClient) {}

  async carregarPerfil(accessToken: string): Promise<void> {
    try {
      const perfil = await firstValueFrom(
        this.http.get<Perfil>(`${environment.apiUrl}/perfil/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      this.perfil.set(perfil);
    } catch {
      this.perfil.set(null);
    }
  }

  limparPerfil(): void {
    this.perfil.set(null);
  }
}
