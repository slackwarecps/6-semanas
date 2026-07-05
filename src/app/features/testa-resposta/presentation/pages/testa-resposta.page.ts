import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import {
  PerguntaLlmService,
  PerguntaResponse
} from '../../../testa-resposta/data/services/pergunta-llm.service';
import { environment } from '../../../../../environments/environment';
import { SqliteAdapter } from '../../../../infrastructure/storage/sqlite.adapter';

@Component({
  selector: 'app-testa-resposta-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './testa-resposta.page.html',
  styleUrls: ['./testa-resposta.page.scss']
})
export class TestaRespostaPage implements OnInit {
  pergunta = '';
  isLoading = false;
  resposta: PerguntaResponse | null = null;
  erro: string | null = null;
  defaultModel = 'Carregando...';
  selectedModel = 'deepseek';

  constructor(
    private readonly perguntaLlmService: PerguntaLlmService,
    private readonly sqliteAdapter: SqliteAdapter,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    const model = await this.sqliteAdapter.getConfig('LLM_QUERY_DEFAULT');
    this.defaultModel = model || 'Não configurado';
    this.selectedModel = model || 'deepseek';
    this.cdr.markForCheck();
  }

  async onModelChange(newModel: string): Promise<void> {
    await this.sqliteAdapter.setConfig('LLM_QUERY_DEFAULT', newModel);
    this.defaultModel = newModel;
    this.cdr.markForCheck();
  }

  async onResponder(): Promise<void> {
    if (!this.pergunta.trim()) return;

    this.ngZone.run(() => {
      this.isLoading = true;
      this.erro = null;
      this.resposta = null;
      this.cdr.markForCheck();
    });

    try {
      const resposta = await this.perguntaLlmService.perguntar({ pergunta: this.pergunta });
      this.ngZone.run(() => {
        this.resposta = resposta;
        this.cdr.markForCheck();
      });
    } catch (err) {
      const erro = this.tratarErro(err);
      this.ngZone.run(() => {
        this.erro = erro;
        this.cdr.markForCheck();
      });
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
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
