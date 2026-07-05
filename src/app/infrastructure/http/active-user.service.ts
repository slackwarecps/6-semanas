import { Injectable } from '@angular/core';

const STORAGE_KEY = 'active_user';
const DEFAULT_USER = 'fabao';

/** Usuários disponíveis no seletor da Navbar. */
export const KNOWN_USERS = ['fabao', 'walle'];

/**
 * Fonte única do usuário ativo do app (Fase 4 da migração).
 *
 * O valor persiste em `localStorage['active_user']` e é lido pelo
 * userIdInterceptor para preencher o header `X-User-Id` de toda requisição
 * ao backend. Trocar de usuário troca o "ambiente" inteiro de dados.
 */
@Injectable({
  providedIn: 'root'
})
export class ActiveUserService {
  get activeUser(): string {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_USER;
  }

  setActiveUser(user: string): void {
    localStorage.setItem(STORAGE_KEY, user);
  }
}
