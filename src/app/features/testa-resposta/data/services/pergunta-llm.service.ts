import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpConfigAdapter } from '../../../../infrastructure/storage/http-config.adapter';

export interface PerguntaRequest {
  pergunta: string;
}

export interface PerguntaResponse {
  resposta: string;
  explicacao: string;
  explicacaoCrianca: string;
  provedor: string;
  modelo: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerguntaLlmService {
  constructor(
    private readonly http: HttpClient,
    private readonly sqliteAdapter: HttpConfigAdapter
  ) {}

  async perguntar(request: PerguntaRequest): Promise<PerguntaResponse> {
    const defaultLlm = await this.sqliteAdapter.getConfig('LLM_QUERY_DEFAULT');
    let provedor = 'claude';
    if (defaultLlm) {
      if (defaultLlm.toLowerCase().includes('deepseek')) {
        provedor = 'deepseek';
      } else if (defaultLlm.toLowerCase().includes('claude')) {
        provedor = 'claude';
      }
    }

    return firstValueFrom(
      this.http.post<PerguntaResponse>(`${environment.backendBaseUrl}/perguntar`, {
        pergunta: request.pergunta,
        provedor: provedor
      })
    );
  }
}
