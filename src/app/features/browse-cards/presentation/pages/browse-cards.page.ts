import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { CardId } from '../../../flashcard/domain/value-objects/card-id.value-object';
import { Tag } from '../../../flashcard/domain/value-objects/tag.value-object';
import { HttpErrorResponse } from '@angular/common/http';
import { PerguntaLlmService } from '../../../testa-resposta/data/services/pergunta-llm.service';

@Component({
  selector: 'app-browse-cards-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './browse-cards.page.html',
  styleUrls: ['./browse-cards.page.scss']
})
export class BrowseCardsPage implements OnInit {
  cards: Card[] = [];
  isLoading = true;
  selectedCard: Card | null = null;
  showEditModal = false;

  // Bottom Sheet IA
  showBottomSheet = false;
  bottomSheetCard: Card | null = null;
  bottomSheetAnswer = '';
  isGeneratingAnswer = false;
  bottomSheetError: string | null = null;

  // Paginação
  readonly itemsPerPage = 3;
  currentPage = 1;
  totalPages = 1;

  editForm = {
    title: '',
    question: '',
    answer: '',
    tags: ''
  };

  constructor(
    private cardRepository: CardRepository,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private perguntaLlmService: PerguntaLlmService
  ) {}

  ngOnInit(): void {
    this.loadCards();
    this.logDatabaseStatus();
  }

  private async logDatabaseStatus(): Promise<void> {
    try {
      const totalCount = await this.cardRepository.count();
      console.log(`\n📊 STATUS DO BANCO`);
      console.log(`Total de cartões NO BANCO: ${totalCount}`);
      console.log(`Cartões carregados na página: ${this.cards.length}`);
    } catch (err) {
      console.error('Erro ao contar cartões:', err);
    }
  }

  async loadCards(): Promise<void> {
    try {
      this.ngZone.run(() => {
        this.isLoading = true;
        this.cdr.markForCheck();
      });

      const allCards = await this.cardRepository.findAll();
      this.ngZone.run(() => {
        this.cards = allCards;
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.cards.length / this.itemsPerPage);
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[BrowseCards] Erro ao carregar cartões:', err);
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  get paginatedCards(): Card[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.cards.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  openEditModal(card: Card): void {
    this.selectedCard = card;
    this.editForm = {
      title: card.title,
      question: card.question,
      answer: card.answer,
      tags: card.tags.map(t => t.name).join(', ')
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedCard = null;
  }

  async saveCard(): Promise<void> {
    if (!this.selectedCard) return;

    if (!this.editForm.title || !this.editForm.question || !this.editForm.answer) {
      alert('⚠️  Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const tagNames = this.editForm.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const updatedCard = new Card({
        id: this.selectedCard.id,
        title: this.editForm.title,
        question: this.editForm.question,
        answer: this.editForm.answer,
        options: this.selectedCard.options,
        tags: tagNames.map(t => new Tag(t)),
        state: this.selectedCard.state,
        interval: this.selectedCard.interval,
        easeFactor: this.selectedCard.easeFactor,
        repetitions: this.selectedCard.repetitions,
        attempts: this.selectedCard.attempts,
        createdAt: this.selectedCard.createdAt,
        updatedAt: new Date(),
        nextReviewDate: this.selectedCard.nextReviewDate
      });

      await this.cardRepository.save(updatedCard);
      console.log(`[BrowseCards] ✅ Cartão "${updatedCard.title}" atualizado`);

      this.closeEditModal();
      await this.loadCards();
    } catch (err) {
      console.error('[BrowseCards] Erro ao salvar cartão:', err);
      alert('❌ Erro ao salvar cartão');
    }
  }

  async deleteCard(card: Card, event: Event): Promise<void> {
    event.stopPropagation();

    const confirmed = confirm(
      `⚠️  Tem certeza que deseja deletar o cartão:\n\n"${card.title}"\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
      await this.cardRepository.delete(card.id);
      console.log(`[BrowseCards] ✅ Cartão "${card.title}" deletado`);

      if (this.selectedCard?.id.value === card.id.value) {
        this.closeEditModal();
      }

      await this.loadCards();
    } catch (err) {
      console.error('[BrowseCards] Erro ao deletar cartão:', err);
      alert('❌ Erro ao deletar cartão');
    }
  }

  goBack(): void {
    this.router.navigate(['/add-card']);
  }

  getTruncatedText(text: string, maxLength: number = 100): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  async responderComIA(card: Card, event: Event): Promise<void> {
    event.stopPropagation();

    this.ngZone.run(() => {
      this.showBottomSheet = true;
      this.bottomSheetCard = card;
      this.bottomSheetAnswer = '';
      this.isGeneratingAnswer = true;
      this.bottomSheetError = null;
      this.cdr.markForCheck();
    });

    try {
      const result = await this.perguntaLlmService.perguntar({
        pergunta: card.question
      });

      this.ngZone.run(() => {
        this.bottomSheetAnswer = result.resposta;
        this.isGeneratingAnswer = false;
        this.cdr.markForCheck();
      });
    } catch (err) {
      const mensagemErro = this.tratarErro(err);
      this.ngZone.run(() => {
        this.bottomSheetError = mensagemErro;
        this.isGeneratingAnswer = false;
        this.cdr.markForCheck();
      });
    }
  }

  private tratarErro(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'Não foi possível conectar ao backend. Verifique se ele está rodando.';
      }
      return (
        err.error?.detail ||
        `Erro ${err.status}: ${err.statusText || 'requisição falhou'}`
      );
    }

    if (err instanceof Error) {
      return err.message;
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  async confirmarAtualizacaoCard(): Promise<void> {
    if (!this.bottomSheetCard || !this.bottomSheetAnswer) return;

    try {
      const updatedCard = new Card({
        id: this.bottomSheetCard.id,
        title: this.bottomSheetCard.title,
        question: this.bottomSheetCard.question,
        answer: this.bottomSheetAnswer,
        options: this.bottomSheetCard.options,
        tags: this.bottomSheetCard.tags,
        state: this.bottomSheetCard.state,
        interval: this.bottomSheetCard.interval,
        easeFactor: this.bottomSheetCard.easeFactor,
        repetitions: this.bottomSheetCard.repetitions,
        attempts: this.bottomSheetCard.attempts,
        createdAt: this.bottomSheetCard.createdAt,
        updatedAt: new Date(),
        nextReviewDate: this.bottomSheetCard.nextReviewDate
      });

      await this.cardRepository.save(updatedCard);
      console.log(`[BrowseCards] ✅ Cartão "${updatedCard.title}" atualizado com resposta da IA`);

      this.cancelarBottomSheet();
      await this.loadCards();
    } catch (err) {
      console.error('[BrowseCards] Erro ao atualizar cartão com IA:', err);
      alert('❌ Erro ao salvar resposta da IA no cartão');
    }
  }

  cancelarBottomSheet(): void {
    this.showBottomSheet = false;
    this.bottomSheetCard = null;
    this.bottomSheetAnswer = '';
    this.bottomSheetError = null;
    this.isGeneratingAnswer = false;
  }
}
