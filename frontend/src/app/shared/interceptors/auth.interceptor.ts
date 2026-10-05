import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

// Envia o token da sessão em toda chamada para a nossa API.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl) || req.headers.has('Authorization')) {
    return next(req);
  }

  const authService = inject(AuthService);

  return from(authService.getSession()).pipe(
    switchMap((session) =>
      next(
        session
          ? req.clone({ setHeaders: { Authorization: `Bearer ${session.access_token}` } })
          : req,
      ),
    ),
  );
};
