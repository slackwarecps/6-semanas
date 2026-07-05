import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

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
  constructor(private readonly http: HttpClient) {}

  async perguntar(request: PerguntaRequest): Promise<PerguntaResponse> {
    return firstValueFrom(
      this.http.post<PerguntaResponse>(`${environment.backendBaseUrl}/perguntar`, {
        pergunta: request.pergunta
      })
    );
  }
}
