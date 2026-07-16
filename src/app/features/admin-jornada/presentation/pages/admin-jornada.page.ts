import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { DeleteJornadaUseCase } from '../../../jornada/application/use-cases/delete-jornada.use-case';
import { GetJornadaDetailUseCase } from '../../../jornada/application/use-cases/get-jornada-detail.use-case';
import { ListAvailableCardsUseCase } from '../../../jornada/application/use-cases/list-available-cards.use-case';
import { ListJornadasUseCase } from '../../../jornada/application/use-cases/list-jornadas.use-case';
import { SaveJornadaUseCase } from '../../../jornada/application/use-cases/save-jornada.use-case';
import { ExportJornadaToPdfUseCase } from '../../../jornada/application/use-cases/export-jornada-to-pdf.use-case';
import { Jornada } from '../../../jornada/domain/entities/jornada.entity';
import { JornadaProgress } from '../../../jornada/domain/entities/jornada-progress.entity';
import { JornadaProgressRepository } from '../../../jornada/data/repositories/jornada-progress.repository';
import { ExportJornadaAdapter } from '../../infrastructure/export-jornada.adapter';

@Component({
  selector: 'app-admin-jornada-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-jornada.page.html',
  styleUrls: ['./admin-jornada.page.scss']
})
export class AdminJornadaPage implements OnInit {
  jornadas: Jornada[] = [];
  availableCards: Card[] = [];
  filteredCards: Card[] = [];

  isLoading = true;
  // T024: Signal para gerenciar estado de exportação
  isExporting = signal(false);
  searchTerm = '';
  
  // Detail
  showDetail = false;
  editingId?: string;
  editingJornada?: Jornada;
  currentTab: 'principal' | 'extras' | 'progresso' = 'principal';
  progressData?: JornadaProgress;
  detailForm = {
    nome: '',
    ordem: 1,
    ativa: false,
    pontosTentativas: 3,
    tipoJornada: 'normal' as 'normal' | 'desafio',
    duracao: 120
  };
  selectedCardIds: Set<string> = new Set<string>();

  private exportAdapter = inject(ExportJornadaAdapter);

  constructor(
    private listJornadasUseCase: ListJornadasUseCase,
    private getJornadaDetailUseCase: GetJornadaDetailUseCase,
    private saveJornadaUseCase: SaveJornadaUseCase,
    private deleteJornadaUseCase: DeleteJornadaUseCase,
    private listAvailableCardsUseCase: ListAvailableCardsUseCase,
    private exportJornadaToPdfUseCase: ExportJornadaToPdfUseCase,
    private progressRepository: JornadaProgressRepository,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadJornadas();
    await this.loadAvailableCards();
  }

  async loadJornadas(): Promise<void> {
    try {
      this.ngZone.run(() => {
        this.isLoading = true;
        this.cdr.markForCheck();
      });
      const data = await this.listJornadasUseCase.execute();
      this.ngZone.run(() => {
        this.jornadas = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[AdminJornada] Erro ao carregar jornadas:', err);
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  async loadAvailableCards(): Promise<void> {
    try {
      const cards = await this.listAvailableCardsUseCase.execute();
      this.availableCards = cards;
      this.filteredCards = [...cards];
    } catch (err) {
      console.error('[AdminJornada] Erro ao carregar cartões disponíveis:', err);
    }
  }

  filterCards(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredCards = [...this.availableCards];
    } else {
      this.filteredCards = this.availableCards.filter(
        card => card.title.toLowerCase().includes(term) || 
                card.tags.some(tag => tag.name.toLowerCase().includes(term))
      );
    }
  }

  openCreateForm(): void {
    this.editingId = undefined;
    this.editingJornada = undefined;
    this.currentTab = 'principal';
    this.detailForm = {
      nome: '',
      ordem: this.jornadas.length + 1,
      ativa: false,
      pontosTentativas: 3,
      tipoJornada: 'normal',
      duracao: 120
    };
    this.selectedCardIds.clear();
    this.searchTerm = '';
    this.filterCards();
    this.showDetail = true;
  }

  async openEditForm(jornada: Jornada): Promise<void> {
    this.editingId = jornada.id;
    this.editingJornada = jornada;
    this.currentTab = 'principal';
    this.detailForm = {
      nome: jornada.nome,
      ordem: jornada.ordem,
      ativa: jornada.ativa,
      pontosTentativas: jornada.pontosTentativas || 3,
      tipoJornada: jornada.tipoJornada,
      duracao: jornada.duracao || 120
    };
    this.selectedCardIds = new Set<string>(jornada.questionCardIds);
    this.searchTerm = '';
    this.filterCards();
    this.showDetail = true;

    // Carregar progresso da jornada
    await this.loadJornadaProgress(jornada.id);
  }

  async loadJornadaProgress(jornadaId: string): Promise<void> {
    try {
      const progress = await this.progressRepository.getProgress(jornadaId);
      this.progressData = progress || JornadaProgress.createDefault(jornadaId, 'locked');
      this.cdr.markForCheck();
    } catch (err) {
      console.error('[AdminJornada] Erro ao carregar progresso:', err);
      this.progressData = JornadaProgress.createDefault(jornadaId, 'locked');
    }
  }

  async saveProgress(): Promise<void> {
    if (!this.progressData) {
      alert('⚠️ Progresso não carregado');
      return;
    }

    try {
      await this.progressRepository.saveProgress(this.progressData);
      alert('✅ Progresso atualizado com sucesso');
    } catch (err) {
      console.error('[AdminJornada] Erro ao salvar progresso:', err);
      alert('❌ Erro ao salvar progresso');
    }
  }

  toggleCardSelection(cardId: string): void {
    if (this.selectedCardIds.has(cardId)) {
      this.selectedCardIds.delete(cardId);
    } else {
      this.selectedCardIds.add(cardId);
    }
  }

  isCardSelected(cardId: string): boolean {
    return this.selectedCardIds.has(cardId);
  }

  async save(): Promise<void> {
    if (!this.detailForm.nome.trim()) {
      alert('⚠️ Por favor, insira o nome da jornada.');
      return;
    }

    if (this.detailForm.duracao <= 0) {
      alert('⚠️ A duração deve ser maior que 0 minutos.');
      return;
    }

    try {
      await this.saveJornadaUseCase.execute({
        id: this.editingId,
        nome: this.detailForm.nome.trim(),
        ordem: this.detailForm.ordem,
        ativa: this.detailForm.ativa,
        pontosTentativas: this.detailForm.pontosTentativas,
        tipoJornada: this.detailForm.tipoJornada,
        duracao: this.detailForm.duracao,
        questionCardIds: Array.from(this.selectedCardIds)
      });

      this.showDetail = false;
      await this.loadJornadas();
    } catch (err) {
      console.error('[AdminJornada] Erro ao salvar jornada:', err);
      alert('❌ Erro ao salvar jornada');
    }
  }

  async toggleAtiva(jornada: Jornada, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await this.saveJornadaUseCase.execute({
        id: jornada.id,
        nome: jornada.nome,
        ordem: jornada.ordem,
        ativa: !jornada.ativa,
        tipoJornada: jornada.tipoJornada,
        duracao: jornada.duracao,
        questionCardIds: jornada.questionCardIds
      });
      await this.loadJornadas();
    } catch (err) {
      console.error('[AdminJornada] Erro ao alterar status ativo:', err);
      alert('❌ Erro ao alterar status ativo');
    }
  }

  async deleteJornada(jornada: Jornada, event: Event): Promise<void> {
    event.stopPropagation();
    const confirmed = confirm(
      `⚠️ Tem certeza que deseja deletar a jornada "${jornada.nome}"?\nEsta ação excluirá o progresso associado a ela.`
    );
    if (!confirmed) return;

    try {
      await this.deleteJornadaUseCase.execute(jornada.id);
      await this.loadJornadas();
      if (this.editingId === jornada.id) {
        this.showDetail = false;
      }
    } catch (err) {
      console.error('[AdminJornada] Erro ao deletar jornada:', err);
      alert('❌ Erro ao deletar jornada');
    }
  }

  cancel(): void {
    this.showDetail = false;
  }

  async exportJornada(jornada: Jornada, event: Event): Promise<void> {
    event.stopPropagation();

    if (jornada.questionCardIds.length === 0) {
      alert('⚠️ A jornada não possui cards associados para exportar');
      return;
    }

    this.isExporting.set(true);
    try {
      await this.exportJornadaToPdfUseCase.execute(jornada.id);
      alert('✅ PDF gerado com sucesso!');
    } catch (err) {
      console.error('[AdminJornada] Erro ao exportar jornada:', err);
      alert('❌ Erro ao gerar PDF da jornada');
    } finally {
      this.isExporting.set(false);
    }
  }

  /**
   * T019-T021: Export jornada to Anki .colpkg format
   */
  async exportJornadaToAnki(jornada: Jornada, event: Event): Promise<void> {
    event.stopPropagation();

    // T019: Validate jornada has cards
    if (jornada.questionCardIds.length === 0) {
      console.warn('[AdminJornada] Nenhum card para exportar nesta jornada');
      return;
    }

    // T024-T025: Set loading state using signal
    this.isExporting.set(true);
    try {
      // T019: Call export adapter
      this.exportAdapter.exportJornadaToAnki(jornada.id).subscribe({
        next: (blob: Blob) => {
          // T020: Trigger download
          this.triggerDownload(blob, jornada.nome);
          // T025: Clear loading state with finalize pattern
          this.isExporting.set(false);
          // T027: Show success toast
          this.showSuccessToast('✅ Exportação completa!');
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          // T021: Handle errors
          this.handleExportError(error);
          // T025: Clear loading state on error
          this.isExporting.set(false);
          this.cdr.markForCheck();
        },
      });
    } catch (err) {
      console.error('[AdminJornada] Erro ao iniciar exportação para Anki:', err);
      this.isExporting.set(false);
    }
  }

  /**
   * T020: Trigger browser download of .colpkg file
   */
  private triggerDownload(blob: Blob, jornadaNome: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Generate filename
    const today = new Date().toISOString().split('T')[0];
    const slug = jornadaNome
      .toLowerCase()
      .replace(/[/<>:*?"|]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-')
      .substring(0, 100)
      .replace(/-$/, '');

    a.download = `jornada-${slug}-${today}.apkg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * T021: Handle export errors
   */
  private handleExportError(error: any): void {
    console.error('[AdminJornada] Erro ao exportar para Anki:', error);
    console.error('[AdminJornada] Error status:', error?.status);
    console.error('[AdminJornada] Error message:', error?.message);
    console.error('[AdminJornada] Error statusText:', error?.statusText);
    console.error('[AdminJornada] Full error object:', JSON.stringify(error, null, 2));

    let message = '❌ Erro ao exportar jornada para Anki';

    if (error?.status === 404) {
      message = '❌ Jornada não encontrada';
    } else if (error?.status === 400) {
      message = '❌ Nenhum card para exportar';
    } else if (error?.status === 500) {
      message = '❌ Erro no servidor ao gerar arquivo';
    } else if (error?.status === 0) {
      message = '❌ Erro de conexão ou CORS';
    }

    console.error('[AdminJornada] Message:', message);
    alert(message);
  }

  /**
   * T027: Show success toast notification
   */
  private showSuccessToast(message: string): void {
    console.log('[AdminJornada] Toast:', message);
    alert(message);
  }

  goBack(): void {
    this.router.navigate(['/learn']);
  }
}
