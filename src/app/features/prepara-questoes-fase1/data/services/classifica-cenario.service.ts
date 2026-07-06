import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpConfigAdapter } from '../../../../infrastructure/storage/http-config.adapter';

export interface ClassificaCenarioRequest {
  titulo: string;
  pergunta: string;
}

export interface ClassificaCenarioResponse {
  cenario: string;
  dominios: string[];
  justificativa: string;
  provedor: string;
  modelo: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClassificaCenarioService {
  private readonly http = inject(HttpClient);
  private readonly configAdapter = inject(HttpConfigAdapter);

  async classificar(request: ClassificaCenarioRequest): Promise<ClassificaCenarioResponse> {
    const defaultLlm = await this.configAdapter.getConfig('LLM_QUERY_DEFAULT');
    let provedor = 'claude';
    if (defaultLlm?.toLowerCase().includes('deepseek')) {
      provedor = 'deepseek';
    }

    return firstValueFrom(
      this.http.post<ClassificaCenarioResponse>(
        `${environment.backendBaseUrl}/classifica-cenario`,
        {
          titulo: request.titulo,
          pergunta: request.pergunta,
          provedor: provedor,
        },
      ),
    );
  }
}
