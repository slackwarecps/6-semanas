import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JornadaProgressRepository } from '../../../jornada/data/repositories/jornada-progress.repository';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-dev-control-panel-page',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="control-panel-container">
      <div class="panel-card">
        <h2>🛠️ Painel de Controle de Desenvolvimento</h2>
        <p>Ações e ferramentas para testes do sistema.</p>
        
        <div class="panel-section">
          <h3>🎮 Reset de Jornada</h3>
          <p>
            Apaga todo o histórico de conclusão de fases, melhores tempos, erros e redefine o XP total do jogador para 0.
          </p>
          <div class="actions">
            <button class="btn btn-danger" (click)="resetJornada()">
              🔥 Resetar Progresso das Jornadas
            </button>
          </div>
          
          <div *ngIf="message" class="message-banner" [class.success]="isSuccess">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .control-panel-container {
      min-height: 100vh;
      background-color: #0f172a;
      color: #f8fafc;
      padding: 40px 24px;
      font-family: 'Inter', sans-serif;
      display: flex;
      justify-content: center;
    }
    
    .panel-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 32px;
      width: 100%;
      max-width: 600px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      
      h2 {
        margin: 0 0 8px 0;
        font-size: 1.5rem;
        font-weight: 800;
        color: #38bdf8;
      }
      
      p {
        color: #94a3b8;
        font-size: 0.95rem;
        margin: 0 0 24px 0;
      }
    }
    
    .panel-section {
      border-top: 1px solid #334155;
      padding-top: 24px;
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: #f8fafc;
      }
      
      p {
        margin-bottom: 16px;
      }
    }
    
    .btn {
      padding: 12px 24px;
      font-size: 0.95rem;
      font-weight: 700;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-danger {
      background-color: #ef4444;
      color: white;
      
      &:hover {
        background-color: #dc2626;
        transform: translateY(-1px);
      }
    }
    
    .message-banner {
      margin-top: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      border-left: 4px solid #ef4444;
      background-color: rgba(239, 68, 68, 0.1);
      color: #f87171;
      
      &.success {
        border-left-color: #22c55e;
        background-color: rgba(34, 197, 94, 0.1);
        color: #4ade80;
      }
    }
  `]
})
export class DevControlPanelPage {
  message = '';
  isSuccess = false;

  constructor(
    private progressRepository: JornadaProgressRepository,
    private cdr: ChangeDetectorRef
  ) {}

  async resetJornada(): Promise<void> {
    if (!confirm('Você tem certeza de que deseja resetar totalmente o progresso das jornadas e seu XP? Esta ação é irreversível.')) {
      return;
    }

    try {
      await this.progressRepository.resetAllProgress();
      this.isSuccess = true;
      this.message = '✅ Progresso de jornadas e XP resetados com sucesso para o estado inicial!';
    } catch (e) {
      this.isSuccess = false;
      this.message = '❌ Ocorreu um erro ao tentar resetar o progresso.';
      console.error(e);
    }
    this.cdr.markForCheck();
  }
}
