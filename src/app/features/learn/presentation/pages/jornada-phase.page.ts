import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { CompleteJornadaUseCase } from '../../../jornada/application/use-cases/complete-jornada.use-case';
import { GetJornadaQuestionsUseCase } from '../../../jornada/application/use-cases/get-jornada-questions.use-case';
import { GetJourneyMapUseCase } from '../../../jornada/application/use-cases/get-journey-map.use-case';
import { JornadaProgressRepository } from '../../../jornada/data/repositories/jornada-progress.repository';
import { JornadaProgress } from '../../../jornada/domain/entities/jornada-progress.entity';

@Component({
  selector: 'app-jornada-phase-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, MarkdownPipe],
  templateUrl: './jornada-phase.page.html',
  styleUrls: ['./jornada-phase.page.scss']
})
export class JornadaPhasePage implements OnInit {
  jornadaId = '';
  jornadaNome = '';
  pontosTentativas = 3;
  questions: Card[] = [];
  currentIndex = 0;
  lives = 3;
  errors = 0;
  sessionXp = 0;
  selectedOptionId: string | null = null;
  showFeedback = false;
  showAnswer = false;
  isCorrectAttempt = false;
  showCopyToast = false;
  showCopyToastFading = false;
  phaseState: 'playing' | 'failed' | 'completed' = 'playing';
  isLoading = true;
  showExplanationDialog = false;
  explanationTitle = '';
  explanationText = '';
  showAnswerBottomSheet = false;
  showFailedDialog = false;
  xpEarnedInThisPlay = 0;
  startTime = Date.now();
  private copyToastTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private copyToastFadeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getJourneyMapUseCase: GetJourneyMapUseCase,
    private getJornadaQuestionsUseCase: GetJornadaQuestionsUseCase,
    private completeJornadaUseCase: CompleteJornadaUseCase,
    private progressRepository: JornadaProgressRepository,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    this.jornadaId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.jornadaId) {
      this.router.navigate(['/learn']);
      return;
    }

    await this.validateAccessAndLoad();
  }

  async validateAccessAndLoad(): Promise<void> {
    try {
      this.ngZone.run(() => {
        this.isLoading = true;
        this.cdr.markForCheck();
      });

      // Validar acesso (só Unlocked ou Completed)
      const mapData = await this.getJourneyMapUseCase.execute();
      const currentItem = mapData.jornadas.find(item => item.jornada.id === this.jornadaId);

      if (!currentItem || currentItem.status === 'locked') {
        console.warn(`[JornadaPhase] Acesso bloqueado para jornada ${this.jornadaId}`);
        this.router.navigate(['/learn']);
        return;
      }

      this.jornadaNome = currentItem.jornada.nome;
      this.pontosTentativas = currentItem.jornada.pontosTentativas || 3;

      // Carregar questões
      const cards = await this.getJornadaQuestionsUseCase.execute(this.jornadaId);
      const progress = await this.progressRepository.getProgress(this.jornadaId);

      this.ngZone.run(() => {
        this.questions = cards;
        this.resetGame();

        if (progress) {
          this.currentIndex = progress.currentQuestionIndex ?? 0;
          this.errors = progress.currentErrors ?? 0;
          this.lives = progress.currentLives ?? this.pontosTentativas;

          // Reseta se vidas esgotaram OU se o progresso está obsoleto
          // (pontosTentativas da jornada mudou desde o último save)
          if (this.lives <= 0 || this.lives > this.pontosTentativas) {
            this.currentIndex = 0;
            this.errors = 0;
            this.lives = this.pontosTentativas;
          }
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[JornadaPhase] Erro ao inicializar jogo:', err);
      this.router.navigate(['/learn']);
    }
  }

  resetGame(): void {
    if (this.copyToastTimeoutId) {
      clearTimeout(this.copyToastTimeoutId);
      this.copyToastTimeoutId = null;
    }
    if (this.copyToastFadeTimeoutId) {
      clearTimeout(this.copyToastFadeTimeoutId);
      this.copyToastFadeTimeoutId = null;
    }

    this.currentIndex = 0;
    this.lives = this.pontosTentativas;
    this.errors = 0;
    this.sessionXp = 0;
    this.selectedOptionId = null;
    this.showFeedback = false;
    this.showAnswer = false;
    this.showCopyToast = false;
    this.showCopyToastFading = false;
    this.showFailedDialog = false;
    this.phaseState = 'playing';
    this.startTime = Date.now();
  }

  async saveCurrentProgress(): Promise<void> {
    try {
      const progress = await this.progressRepository.getProgress(this.jornadaId);
      const currentStatus = (progress && progress.status) ? progress.status : 'unlocked';
      await this.progressRepository.saveProgress(new JornadaProgress({
        jornadaId: this.jornadaId,
        status: currentStatus,
        bestErrors: progress ? progress.bestErrors : null,
        completedAt: progress ? progress.completedAt : null,
        currentQuestionIndex: this.currentIndex,
        currentErrors: this.errors,
        currentLives: this.lives,
        lastActiveAt: new Date()
      }));
    } catch (e) {
      console.error('[JornadaPhase] Erro ao salvar progresso:', e);
    }
  }

  async recordSelfEvaluation(isCorrect: boolean): Promise<void> {
    this.showAnswerBottomSheet = false;

    this.ngZone.run(async () => {
      if (isCorrect) {
        this.sessionXp += 10;
      } else {
        this.lives--;
        this.errors++;
      }

      if (this.lives <= 0) {
        this.showFailedDialog = true;
        this.currentIndex = 0;
        this.errors = 0;
        this.lives = this.pontosTentativas;
        await this.saveCurrentProgress();
      } else {
        this.currentIndex++;
        if (this.currentIndex === this.questions.length) {
          this.phaseState = 'completed';
          const progress = await this.progressRepository.getProgress(this.jornadaId);
          const isReplay = progress && progress.status === 'completed';
          this.xpEarnedInThisPlay = isReplay ? 0 : (this.sessionXp + 50);
          const timeSpentSeconds = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));
          await this.completeJornadaUseCase.execute(this.jornadaId, this.errors, this.sessionXp, timeSpentSeconds);
        } else {
          await this.saveCurrentProgress();
        }
      }

      this.selectedOptionId = null;
      this.showFeedback = false;
      this.showAnswer = false;
      this.cdr.markForCheck();
    });
  }

  async restartJornada(): Promise<void> {
    this.showFailedDialog = false;
    this.resetGame();
    await this.saveCurrentProgress();
    this.cdr.markForCheck();
  }

  get currentCard(): Card | undefined {
    return this.questions[this.currentIndex];
  }

  selectOption(optionId: string): void {
    if (this.showFeedback) return;
    this.selectedOptionId = optionId;
  }

  async copyQuestion(): Promise<void> {
    if (!this.currentCard) return;

    await navigator.clipboard.writeText(this.currentCard.question);
    this.showCopyToast = true;
    this.showCopyToastFading = false;

    if (this.copyToastTimeoutId) {
      clearTimeout(this.copyToastTimeoutId);
    }
    if (this.copyToastFadeTimeoutId) {
      clearTimeout(this.copyToastFadeTimeoutId);
    }

    this.copyToastFadeTimeoutId = setTimeout(() => {
      this.showCopyToastFading = true;
      this.cdr.markForCheck();
    }, 1600);

    this.copyToastTimeoutId = setTimeout(() => {
      this.showCopyToast = false;
      this.showCopyToastFading = false;
      this.copyToastTimeoutId = null;
      this.copyToastFadeTimeoutId = null;
      this.cdr.markForCheck();
    }, 2000);

    this.cdr.markForCheck();
  }

  openExplanation(type: 'technical' | 'kids' | 'translation' = 'technical'): void {
    if (!this.currentCard) return;
    if (type === 'technical') {
      this.explanationTitle = 'Explicação Técnica';
      this.explanationText = this.currentCard.explanation || 'Nenhuma explicação técnica disponível para este cartão.';
    } else if (type === 'kids') {
      this.explanationTitle = 'Explicação Simplificada';
      this.explanationText = this.currentCard.tenYearOld || 'Nenhuma explicação simplificada disponível para este cartão.';
    } else if (type === 'translation') {
      this.explanationTitle = 'Tradução';
      this.explanationText = this.currentCard.traducao || 'Nenhuma tradução disponível para este cartão.';
    }
    this.showExplanationDialog = true;
    this.cdr.markForCheck();
  }

  closeExplanation(): void {
    this.showExplanationDialog = false;
    this.cdr.markForCheck();
  }

  browseCard(): void {
    if (!this.currentCard) return;
    this.router.navigate(['/browse-cards'], {
      queryParams: { cardId: this.currentCard.id.value }
    });
  }

  openAnswerBottomSheet(): void {
    if (!this.currentCard) return;
    this.showAnswerBottomSheet = true;
    this.cdr.markForCheck();
  }

  closeAnswerBottomSheet(): void {
    this.showAnswerBottomSheet = false;
    this.cdr.markForCheck();
  }

  confirm(): void {
    if (this.phaseState !== 'playing' || !this.currentCard) return;

    if (!this.showFeedback) {
      if (!this.selectedOptionId) return;

      const correctOption = this.currentCard.options?.find(o => o.isCorrect);
      this.isCorrectAttempt = correctOption ? this.selectedOptionId === correctOption.id : false;

      this.ngZone.run(() => {
        this.showFeedback = true;
        this.showAnswer = true;

        if (this.isCorrectAttempt) {
          this.sessionXp += 10;
        } else {
          this.lives--;
          this.errors++;
        }
        this.cdr.markForCheck();
      });
    } else {
      this.ngZone.run(async () => {
        if (this.lives === 0) {
          this.showFailedDialog = true;
          this.currentIndex = 0;
          this.errors = 0;
          this.lives = this.pontosTentativas;
          await this.saveCurrentProgress();
          this.cdr.markForCheck();
          return;
        }

        this.currentIndex++;
        this.selectedOptionId = null;
        this.showFeedback = false;
        this.showAnswer = false;

        if (this.currentIndex === this.questions.length) {
          this.phaseState = 'completed';
          this.cdr.markForCheck();
          const progress = await this.progressRepository.getProgress(this.jornadaId);
          const isReplay = progress && progress.status === 'completed';
          this.xpEarnedInThisPlay = isReplay ? 0 : (this.sessionXp + 50);
          const timeSpentSeconds = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));
          await this.completeJornadaUseCase.execute(this.jornadaId, this.errors, this.sessionXp, timeSpentSeconds);
        } else {
          await this.saveCurrentProgress();
        }
        this.cdr.markForCheck();
      });
    }
  }

  goToFirstQuestion(): void {
    if (!this.canGoToFirstQuestion) return;
    this.navigateToQuestion(0);
  }

  goToPreviousQuestion(): void {
    if (!this.canGoToPreviousQuestion) return;
    this.navigateToQuestion(this.currentIndex - 1);
  }

  goToNextQuestion(): void {
    if (!this.canGoToNextQuestion) return;
    this.navigateToQuestion(this.currentIndex + 1);
  }

  goToLastQuestion(): void {
    if (!this.canGoToLastQuestion) return;
    this.navigateToQuestion(this.questions.length - 1);
  }

  private navigateToQuestion(index: number): void {
    if (index < 0 || index >= this.questions.length) return;

    this.currentIndex = index;
    this.selectedOptionId = null;
    this.showFeedback = false;
    this.showAnswer = false;
    this.isCorrectAttempt = false;
    this.cdr.markForCheck();
  }

  get heartArray(): number[] {
    return Array(this.pontosTentativas).fill(0);
  }

  get canGoToFirstQuestion(): boolean {
    return this.questions.length > 0 && this.currentIndex > 0;
  }

  get canGoToPreviousQuestion(): boolean {
    return this.questions.length > 0 && this.currentIndex > 0;
  }

  get canGoToNextQuestion(): boolean {
    return this.questions.length > 0 && this.currentIndex < this.questions.length - 1;
  }

  get canGoToLastQuestion(): boolean {
    return this.questions.length > 0 && this.currentIndex < this.questions.length - 1;
  }
}
