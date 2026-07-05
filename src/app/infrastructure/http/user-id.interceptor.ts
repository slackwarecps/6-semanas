import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActiveUserService } from './active-user.service';

/**
 * Adiciona o header `X-User-Id` a toda requisição destinada ao backend
 * (identificado pelo environment.backendBaseUrl). Requisições para outros
 * destinos passam intactas.
 *
 * O usuário vem do ActiveUserService (localStorage), selecionável na Navbar.
 */
export const userIdInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.backendBaseUrl)) {
    return next(req);
  }

  const activeUser = inject(ActiveUserService).activeUser;
  return next(req.clone({ setHeaders: { 'X-User-Id': activeUser } }));
};
