import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { CardDisplayComponent } from '../../../../shared/components/card-display/card-display.component';
import { SrsButtonsComponent } from '../../../../shared/components/srs-buttons/srs-buttons.component';
import { GetNextCardUseCase } from '../../../flashcard/application/use-cases/get-next-card.use-case';
import { RecordCardAttemptUseCase } from '../../../flashcard/application/use-cases/record-card-attempt.use-case';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { Tag } from '../../../flashcard/domain/value-objects/tag.value-object';
import { QualityValue } from '../../../flashcard/domain/value-objects/quality.value-object';

interface EditForm {
  title: string;
  question: string;
  answer: string;
  tags: string;
}

@Component({
  selector: 'app-study-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, CardDisplayComponent, SrsButtonsComponent],
  templateUrl: './study.page.html',
  styleUrls: ['./study.page.scss']
})
export class StudyPage implements OnInit {
  currentCard: Card | null = null;
  showAnswer = false;
  isLoading = true;
  sessionFinished = false;
  cardNumber = 0;
  showEditModal = false;
  editForm: EditForm = { title: '', question: '', answer: '', tags: '' };
  private cardShownAt = 0;

  constructor(
    private readonly getNextCardUseCase: GetNextCardUseCase,
    private readonly recordCardAttemptUseCase: RecordCardAttemptUseCase,
    private readonly cardRepository: CardRepository,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadNextCard();
  }

  get cardNumberLabel(): string {
    return String(this.cardNumber).padStart(3, '0');
  }

  async loadNextCard(): Promise<void> {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.showAnswer = false;
      this.cdr.markForCheck();
    });

    try {
      const nextCard = await this.getNextCardUseCase.execute();
      this.ngZone.run(() => {
        this.currentCard = nextCard;
        this.sessionFinished = !nextCard;
        if (nextCard) {
          this.cardNumber++;
        }
        this.cardShownAt = Date.now();
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[Study] Erro ao carregar próximo cartão:', err);
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  revealAnswer(): void {
    this.showAnswer = true;
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

    await this.loadNextCard();
  }

  openEditModal(): void {
    if (!this.currentCard) return;

    this.editForm = {
      title: this.currentCard.title,
      question: this.currentCard.question,
      answer: this.currentCard.answer,
      tags: this.currentCard.tags.map(tag => tag.name).join(', ')
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
        nextReviewDate: this.currentCard.nextReviewDate
      });

      await this.cardRepository.save(updatedCard);

      this.ngZone.run(() => {
        this.currentCard = updatedCard;
        this.showEditModal = false;
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[Study] Erro ao salvar edição do cartão:', err);
      alert('❌ Erro ao salvar cartão');
    }
  }
}
