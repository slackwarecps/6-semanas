import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Configurações por usuário no backend (rotas /config), substituindo o
 * getConfig/setConfig do SqliteAdapter legado. Chave inexistente → null,
 * como no contrato original.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpConfigAdapter {
  private readonly baseUrl = `${environment.backendBaseUrl}/config`;

  constructor(private readonly http: HttpClient) {}

  async getConfig(chave: string): Promise<string | null> {
    try {
      const dto = await firstValueFrom(
        this.http.get<{ chave: string; valor: string }>(`${this.baseUrl}/${chave}`)
      );
      return dto.valor;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async setConfig(chave: string, valor: string): Promise<void> {
    await firstValueFrom(this.http.put(`${this.baseUrl}/${chave}`, { valor }));
  }
}
