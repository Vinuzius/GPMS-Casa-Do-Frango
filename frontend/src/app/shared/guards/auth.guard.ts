import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authGuard: CanActivateFn = async () => {
  if (environment.bypassAuth) return true;

  const authService = inject(AuthService);
  const router = inject(Router);

  const session = await authService.getSession();
  return session ? true : router.createUrlTree(['/login']);
};
