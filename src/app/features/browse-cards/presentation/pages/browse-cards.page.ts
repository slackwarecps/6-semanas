import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { Tag } from '../../../flashcard/domain/value-objects/tag.value-object';
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
  filteredCards: Card[] = [];
  searchQuestionTerm = '';
  searchTagTerm = '';
  cardIdFilter: string | null = null;
  isLoading = true;
  selectedCard: Card | null = null;
  showEditModal = false;
  showQuestionEditor = false;
  questionEditorSnapshot = '';


  // Bottom Sheet IA
  showBottomSheet = false;
  bottomSheetCard: Card | null = null;
  bottomSheetTranslation = '';
  bottomSheetAnswer = '';
  bottomSheetExplicacao = '';
  bottomSheetExplicacaoCrianca = '';
  isGeneratingAnswer = false;
  bottomSheetError: string | null = null;

  // Paginação
  itemsPerPage = 3;
  readonly itemsPerPageOptions = [3, 10, 50, 100];
  currentPage = 1;
  totalPages = 1;

  editForm = {
    title: '',
    question: '',
    answer: '',
    tags: '',
    traducao: '',
    explanation: '',
    tenYearOld: ''
  };

  constructor(
    private cardRepository: CardRepository,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private perguntaLlmService: PerguntaLlmService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.cardIdFilter = params['cardId'] || null;
    });
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
        this.applyFilter();
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

  applyFilter(): void {
    const questionTerm = this.searchQuestionTerm.trim().toLowerCase();
    const tagTerm = this.searchTagTerm.trim().toLowerCase();

    this.filteredCards = this.cards.filter(card => {
      const matchesQuestion = !questionTerm || card.question.toLowerCase().includes(questionTerm);
      const matchesTag = !tagTerm || card.tags.some(tag => tag.name.toLowerCase().includes(tagTerm));
      const matchesCardId = !this.cardIdFilter || card.id.value === this.cardIdFilter;
      return matchesQuestion && matchesTag && matchesCardId;
    });

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredCards.length / this.itemsPerPage);
  }

  onSearchInput(): void {
    this.applyFilter();
  }

  onItemsPerPageChange(value: any): void {
    this.itemsPerPage = Number(value);
    this.applyFilter();
  }

  get paginatedCards(): Card[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredCards.slice(start, end);
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
      tags: card.tags.map(t => t.name).join(', '),
      traducao: card.traducao || '',
      explanation: card.explanation || '',
      tenYearOld: card.tenYearOld || ''
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
        seq: this.selectedCard.seq,
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
        nextReviewDate: this.selectedCard.nextReviewDate,
        traducao: this.editForm.traducao || undefined,
        explanation: this.editForm.explanation || undefined,
        tenYearOld: this.editForm.tenYearOld || undefined
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
      this.bottomSheetExplicacao = '';
      this.bottomSheetExplicacaoCrianca = '';
      this.isGeneratingAnswer = true;
      this.bottomSheetError = null;
      this.cdr.markForCheck();
    });

    try {
      const result = await this.perguntaLlmService.perguntar({
        pergunta: this.formatQuestionWithOptions(card)
      });

      this.ngZone.run(() => {
        this.bottomSheetAnswer = result.resposta;
        const [translation, explanation] = this.splitCombinedExplanation(result.explicacao);
        this.bottomSheetExplicacao = explanation;
        this.bottomSheetExplicacaoCrianca = result.explicacaoCrianca;
        this.bottomSheetTranslation = translation;
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

  private formatQuestionWithOptions(card: Card): string {
    if (!card.options || card.options.length === 0) {
      return card.question;
    }

    const optionLines = [...card.options]
      .sort((a, b) => a.order - b.order)
      .map(option => `[ ] ${option.id} - ${option.text}`)
      .join('\n');

    return `${card.question}\n\n${optionLines}`;
  }

  private splitCombinedExplanation(text: string): [string, string] {
    const separator = '\n---\n';
    const index = text.indexOf(separator);

    if (index === -1) {
      return [text.trim(), ''];
    }

    return [
      text.slice(0, index).trim(),
      text.slice(index + separator.length).trim(),
    ];
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
        seq: this.bottomSheetCard.seq,
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
        nextReviewDate: this.bottomSheetCard.nextReviewDate,
        traducao: this.bottomSheetTranslation || undefined,
        explanation: this.bottomSheetExplicacao || undefined,
        tenYearOld: this.bottomSheetExplicacaoCrianca || undefined
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
    this.bottomSheetExplicacao = '';
    this.bottomSheetExplicacaoCrianca = '';
    this.bottomSheetError = null;
    this.isGeneratingAnswer = false;
  }

  openQuestionEditor(): void {
    this.questionEditorSnapshot = this.editForm.question;
    this.showQuestionEditor = true;
  }

  closeQuestionEditor(): void {
    this.editForm.question = this.questionEditorSnapshot;
    this.showQuestionEditor = false;
  }

  saveQuestionEditor(): void {
    this.showQuestionEditor = false;
  }

  onQuestionInput(): void {
    // Hook para reatividade futura (ex: auto-save)
  }

  countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}
