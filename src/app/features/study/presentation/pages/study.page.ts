import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardDisplayComponent } from '../../../../shared/components/card-display/card-display.component';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SrsButtonsComponent } from '../../../../shared/components/srs-buttons/srs-buttons.component';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';
import { GetNextCardUseCase } from '../../../flashcard/application/use-cases/get-next-card.use-case';
import { RecordCardAttemptUseCase } from '../../../flashcard/application/use-cases/record-card-attempt.use-case';
import { ResetAllCardsToNewUseCase } from '../../../flashcard/application/use-cases/reset-all-cards-to-new.use-case';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { QualityValue } from '../../../flashcard/domain/value-objects/quality.value-object';
import { Tag } from '../../../flashcard/domain/value-objects/tag.value-object';

interface EditForm {
  title: string;
  question: string;
  answer: string;
  tags: string;
  explanation?: string;
  tenYearOld?: string;
}

@Component({
  selector: 'app-study-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, CardDisplayComponent, SrsButtonsComponent, MarkdownPipe],
  templateUrl: './study.page.html',
  styleUrls: ['./study.page.scss']
})
export class StudyPage implements OnInit {
  queue: Card[] = [];
  currentIndex = 0;
  currentCard: Card | null = null;
  showAnswer = false;
  isLoading = true;
  sessionFinished = false;
  showTranslation = false;
  showExplanation = false;
  showTenYearOld = false;
  showEditModal = false;
  editForm: EditForm = { title: '', question: '', answer: '', tags: '', explanation: '', tenYearOld: '' };
  showResetToNewDialog = false;
  isResettingToNew = false;
  resetProgress = { current: 0, total: 0 };
  totalCardsCount = 0;
  private cardShownAt = 0;

  constructor(
    private readonly getNextCardUseCase: GetNextCardUseCase,
    private readonly recordCardAttemptUseCase: RecordCardAttemptUseCase,
    private readonly resetAllCardsToNewUseCase: ResetAllCardsToNewUseCase,
    private readonly cardRepository: CardRepository,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadQueue();
  }

  get cardNumberLabel(): string {
    return String(this.currentCard?.seq ?? 0).padStart(3, '0');
  }

  get canGoPrevious(): boolean {
    return this.currentIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentIndex < this.queue.length - 1;
  }

  async loadQueue(): Promise<void> {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.cdr.markForCheck();
    });

    try {
      const [due, total] = await Promise.all([
        this.getNextCardUseCase.executeAll(),
        this.cardRepository.count()
      ]);
      this.ngZone.run(() => {
        this.queue = due;
        this.totalCardsCount = total;
        this.currentIndex = 0;
        this.showCardAt(0);
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[Study] Erro ao carregar fila de cartões:', err);
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  private showCardAt(index: number): void {
    this.currentIndex = index;
    this.currentCard = this.queue[index] ?? null;
    this.sessionFinished = !this.currentCard;
    this.showAnswer = false;
    this.showTranslation = false;
    this.showExplanation = false;
    this.showTenYearOld = false;
    this.cardShownAt = Date.now();
  }

  goToPrevious(): void {
    if (!this.canGoPrevious) return;
    this.showCardAt(this.currentIndex - 1);
  }

  goToNext(): void {
    if (!this.canGoNext) return;
    this.showCardAt(this.currentIndex + 1);
  }

  revealAnswer(): void {
    this.showAnswer = true;
  }

  toggleExplanation(): void {
    this.showExplanation = !this.showExplanation;
  }

  toggleTenYearOld(): void {
    this.showTenYearOld = !this.showTenYearOld;
  }

  toggleTranslation(): void {
    this.showTranslation = !this.showTranslation;
  }

  get currentCardTranslation(): string {
    return this.currentCard?.traducao ?? this.parseCombinedExplanation(this.currentCard?.explanation ?? '')[0];
  }

  get currentCardExplanation(): string {
    return this.parseCombinedExplanation(this.currentCard?.explanation ?? '')[1];
  }

  async rate(quality: QualityValue): Promise<void> {
    if (!this.currentCard) return;

    const elapsedTime = Date.now() - this.cardShownAt;

    try {
      await this.recordCardAttemptUseCase.execute({
        card: this.currentCard,
        quality,
        elapsedTime,
        wasCorrect: quality >= 3
      });
    } catch (err) {
      console.error('[Study] Erro ao registrar tentativa:', err);
    }

    this.ngZone.run(() => {
      this.queue = this.queue.filter((_, i) => i !== this.currentIndex);
      const nextIndex = Math.min(this.currentIndex, this.queue.length - 1);
      this.showCardAt(nextIndex);
      this.cdr.markForCheck();
    });
  }

  openEditModal(): void {
    if (!this.currentCard) return;

    this.editForm = {
      title: this.currentCard.title,
      question: this.currentCard.question,
      answer: this.currentCard.answer,
      tags: this.currentCard.tags.map(tag => tag.name).join(', '),
      explanation: this.currentCard.explanation || '',
      tenYearOld: this.currentCard.tenYearOld || ''
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  async saveCardEdit(): Promise<void> {
    if (!this.currentCard) return;

    if (!this.editForm.title.trim() || !this.editForm.question.trim() || !this.editForm.answer.trim()) {
      alert('⚠️  Preencha título, pergunta e resposta.');
      return;
    }

    try {
      const tagNames = this.editForm.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const updatedCard = new Card({
        id: this.currentCard.id,
        seq: this.currentCard.seq,
        title: this.editForm.title.trim(),
        question: this.editForm.question.trim(),
        answer: this.editForm.answer.trim(),
        options: this.currentCard.options,
        tags: tagNames.map(name => new Tag(name)),
        state: this.currentCard.state,
        interval: this.currentCard.interval,
        easeFactor: this.currentCard.easeFactor,
        repetitions: this.currentCard.repetitions,
        attempts: this.currentCard.attempts,
        createdAt: this.currentCard.createdAt,
        updatedAt: new Date(),
        nextReviewDate: this.currentCard.nextReviewDate,
        traducao: this.currentCard.traducao,
        explanation: this.editForm.explanation || undefined,
        tenYearOld: this.editForm.tenYearOld || undefined
      });

      await this.cardRepository.save(updatedCard);

      this.ngZone.run(() => {
        this.currentCard = updatedCard;
        this.queue[this.currentIndex] = updatedCard;
        this.showEditModal = false;
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[Study] Erro ao salvar edição do cartão:', err);
      alert('❌ Erro ao salvar cartão');
    }
  }

  openResetToNewDialog(): void {
    this.showResetToNewDialog = true;
  }

  closeResetToNewDialog(): void {
    this.showResetToNewDialog = false;
  }

  async confirmResetToNew(): Promise<void> {
    this.ngZone.run(() => {
      this.isResettingToNew = true;
      this.resetProgress = { current: 0, total: 0 };
      this.cdr.markForCheck();
    });

    try {
      await this.resetAllCardsToNewUseCase.execute((current, total) => {
        this.ngZone.run(() => {
          this.resetProgress = { current, total };
          this.cdr.markForCheck();
        });
      });
      await this.loadQueue();
    } catch (err) {
      console.error('[Study] Erro ao resetar cartões para New:', err);
      alert('❌ Erro ao resetar as perguntas para o estado New');
    } finally {
      this.ngZone.run(() => {
        this.isResettingToNew = false;
        this.showResetToNewDialog = false;
        this.cdr.markForCheck();
      });
    }
  }

  get resetProgressPercent(): number {
    if (!this.resetProgress.total) return 0;
    return Math.round((this.resetProgress.current / this.resetProgress.total) * 100);
  }

  private parseCombinedExplanation(text: string): [string, string] {
    const separator = '\n---\n';
    const index = text.indexOf(separator);

    if (index === -1) {
      return ['', text.trim()];
    }

    return [
      text.slice(0, index).trim(),
      text.slice(index + separator.length).trim(),
    ];
  }
}
