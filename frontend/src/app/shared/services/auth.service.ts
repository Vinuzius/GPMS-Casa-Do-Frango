import { Injectable, signal } from '@angular/core';
import { createClient, Session, User } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';
import { PerfilService } from './perfil.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = createClient(environment.supabaseUrl, environment.supabasePublishableKey);

  readonly session = signal<Session | null>(null);
  readonly user = signal<User | null>(null);

  constructor(private perfilService: PerfilService) {
    this.supabase.auth.getSession().then(({ data }) => this.applySession(data.session));
    this.supabase.auth.onAuthStateChange((_event, session) => this.applySession(session));
  }

  private applySession(session: Session | null): void {
    this.session.set(session);
    this.user.set(session?.user ?? null);

    if (session) {
      this.perfilService.carregarPerfil(session.access_token);
    } else {
      this.perfilService.limparPerfil();
    }
  }

  signIn(email: string, senha: string) {
    return this.supabase.auth.signInWithPassword({ email, password: senha });
  }

  signUp(email: string, senha: string, nome: string, telefone?: string) {
    return this.supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome, telefone } },
    });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  getSession(): Promise<Session | null> {
    return this.supabase.auth.getSession().then((r) => r.data.session);
  }
}
