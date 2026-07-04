import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import {
  PerguntaLlmService,
  PerguntaResponse
} from '../../../testa-resposta/data/services/pergunta-llm.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-testa-resposta-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './testa-resposta.page.html',
  styleUrls: ['./testa-resposta.page.scss']
})
export class TestaRespostaPage {
  pergunta = '';
  isLoading = false;
  resposta: PerguntaResponse | null = null;
  erro: string | null = null;

  constructor(private readonly perguntaLlmService: PerguntaLlmService) {}

  async onResponder(): Promise<void> {
    if (!this.pergunta.trim()) return;

    this.isLoading = true;
    this.erro = null;
    this.resposta = null;

    try {
      this.resposta = await this.perguntaLlmService.perguntar({ pergunta: this.pergunta });
    } catch (err) {
      this.erro = this.tratarErro(err);
    } finally {
      this.isLoading = false;
    }
  }

  private tratarErro(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return `Não foi possível conectar ao backend. Verifique se ele está rodando em ${environment.backendBaseUrl}.`;
      }
      return err.error?.detail || `Erro ${err.status}: ${err.statusText || 'requisição falhou'}`;
    }

    if (err instanceof Error) {
      return err.message;
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}
