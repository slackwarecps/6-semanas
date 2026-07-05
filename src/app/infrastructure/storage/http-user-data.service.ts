import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Operações administrativas sobre os dados do usuário ativo no backend.
 * Usado pelo botão "Resetar Cartões" da Navbar.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpUserDataService {
  constructor(private readonly http: HttpClient) {}

  /** Apaga TODOS os dados do usuário ativo (cards, jornadas, progresso, XP, config). */
  async resetAllData(): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${environment.backendBaseUrl}/user-data`));
  }
}
