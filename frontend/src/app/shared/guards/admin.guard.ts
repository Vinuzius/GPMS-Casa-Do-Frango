import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { PerfilService } from '../services/perfil.service';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const perfilService = inject(PerfilService);
  const router = inject(Router);

  const session = await authService.getSession();
  if (!session) return router.createUrlTree(['/login']);

  const perfil = await perfilService.obterPerfil(session.access_token);
  return perfil?.is_admin ? true : router.createUrlTree(['/dashboard']);
};
