import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { CardDisplayComponent } from '../../../../shared/components/card-display/card-display.component';
import { SrsButtonsComponent } from '../../../../shared/components/srs-buttons/srs-buttons.component';
import { GetNextCardUseCase } from '../../../flashcard/application/use-cases/get-next-card.use-case';
import { RecordCardAttemptUseCase } from '../../../flashcard/application/use-cases/record-card-attempt.use-case';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { QualityValue } from '../../../flashcard/domain/value-objects/quality.value-object';

@Component({
  selector: 'app-study-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CardDisplayComponent, SrsButtonsComponent],
  templateUrl: './study.page.html',
  styleUrls: ['./study.page.scss']
})
export class StudyPage implements OnInit {
  currentCard: Card | null = null;
  showAnswer = false;
  isLoading = true;
  sessionFinished = false;
  private cardShownAt = 0;

  constructor(
    private readonly getNextCardUseCase: GetNextCardUseCase,
    private readonly recordCardAttemptUseCase: RecordCardAttemptUseCase,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadNextCard();
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
}
