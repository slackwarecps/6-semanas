import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { DeleteJornadaUseCase } from '../../../jornada/application/use-cases/delete-jornada.use-case';
import { GetJornadaDetailUseCase } from '../../../jornada/application/use-cases/get-jornada-detail.use-case';
import { ListAvailableCardsUseCase } from '../../../jornada/application/use-cases/list-available-cards.use-case';
import { ListJornadasUseCase } from '../../../jornada/application/use-cases/list-jornadas.use-case';
import { SaveJornadaUseCase } from '../../../jornada/application/use-cases/save-jornada.use-case';
import { Jornada } from '../../../jornada/domain/entities/jornada.entity';

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
  searchTerm = '';
  
  // Detail
  showDetail = false;
  editingId?: string;
  editingJornada?: Jornada;
  currentTab: 'principal' | 'extras' = 'principal';
  detailForm = {
    nome: '',
    ordem: 1,
    ativa: false,
    pontosTentativas: 3,
    tipoJornada: 'normal' as 'normal' | 'desafio',
    duracao: 120,
    descricao: '',
    observacoes: '',
    tags: ''
  };
  selectedCardIds: Set<string> = new Set<string>();

  constructor(
    private listJornadasUseCase: ListJornadasUseCase,
    private getJornadaDetailUseCase: GetJornadaDetailUseCase,
    private saveJornadaUseCase: SaveJornadaUseCase,
    private deleteJornadaUseCase: DeleteJornadaUseCase,
    private listAvailableCardsUseCase: ListAvailableCardsUseCase,
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
      duracao: 120,
      descricao: '',
      observacoes: '',
      tags: ''
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
      duracao: jornada.duracao || 120,
      descricao: (jornada as any).descricao || '',
      observacoes: (jornada as any).observacoes || '',
      tags: (jornada as any).tags || ''
    };
    this.selectedCardIds = new Set<string>(jornada.questionCardIds);
    this.searchTerm = '';
    this.filterCards();
    this.showDetail = true;
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

  goBack(): void {
    this.router.navigate(['/learn']);
  }
}
