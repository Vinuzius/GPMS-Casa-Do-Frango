import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { Perfil, PerfilService } from '../services/perfil.service';
import { adminGuard } from './admin.guard';

function executarGuard(session: unknown, perfil: Perfil | null) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { getSession: async () => session } },
      { provide: PerfilService, useValue: { obterPerfil: async () => perfil } },
    ],
  });

  return TestBed.runInInjectionContext(() =>
    adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  ) as Promise<boolean | UrlTree>;
}

function perfil(is_admin: boolean): Perfil {
  return { id: '1', nome: 'Teste', telefone: null, is_admin };
}

describe('adminGuard', () => {
  it('manda para o login quando não há sessão', async () => {
    const resultado = await executarGuard(null, null);

    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/login');
  });

  it('manda o cliente comum para o dashboard', async () => {
    const resultado = await executarGuard({ access_token: 't' }, perfil(false));

    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/dashboard');
  });

  it('manda para o dashboard quando o perfil não carrega', async () => {
    const resultado = await executarGuard({ access_token: 't' }, null);

    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/dashboard');
  });

  it('libera o administrador', async () => {
    const resultado = await executarGuard({ access_token: 't' }, perfil(true));

    expect(resultado).toBe(true);
  });
});
