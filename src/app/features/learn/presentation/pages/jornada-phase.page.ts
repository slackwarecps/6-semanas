import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';
import { GetJourneyMapUseCase } from '../../../jornada/application/use-cases/get-journey-map.use-case';
import { GetJornadaQuestionsUseCase } from '../../../jornada/application/use-cases/get-jornada-questions.use-case';
import { CompleteJornadaUseCase } from '../../../jornada/application/use-cases/complete-jornada.use-case';
import { Card } from '../../../flashcard/domain/entities/card.entity';

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
  questions: Card[] = [];
  currentIndex = 0;
  lives = 3;
  errors = 0;
  sessionXp = 0;
  selectedOptionId: string | null = null;
  showFeedback = false;
  showAnswer = false;
  isCorrectAttempt = false;
  phaseState: 'playing' | 'failed' | 'completed' = 'playing';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getJourneyMapUseCase: GetJourneyMapUseCase,
    private getJornadaQuestionsUseCase: GetJornadaQuestionsUseCase,
    private completeJornadaUseCase: CompleteJornadaUseCase,
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

      // Carregar questões
      const cards = await this.getJornadaQuestionsUseCase.execute(this.jornadaId);
      this.ngZone.run(() => {
        this.questions = cards;
        this.resetGame();
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[JornadaPhase] Erro ao inicializar jogo:', err);
      this.router.navigate(['/learn']);
    }
  }

  resetGame(): void {
    this.currentIndex = 0;
    this.lives = 3;
    this.errors = 0;
    this.sessionXp = 0;
    this.selectedOptionId = null;
    this.showFeedback = false;
    this.showAnswer = false;
    this.phaseState = 'playing';
  }

  get currentCard(): Card | undefined {
    return this.questions[this.currentIndex];
  }

  selectOption(optionId: string): void {
    if (this.showFeedback) return;
    this.selectedOptionId = optionId;
  }

  confirm(): void {
    if (this.phaseState !== 'playing' || !this.currentCard) return;

    if (!this.showFeedback) {
      // Validar resposta
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
      // Continuar para o próximo ou finalizar
      this.ngZone.run(async () => {
        if (this.lives === 0) {
          this.phaseState = 'failed';
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
          // Salvar conclusão
          await this.completeJornadaUseCase.execute(this.jornadaId, this.errors, this.sessionXp);
        }
        this.cdr.markForCheck();
      });
    }
  }

  get heartArray(): number[] {
    return Array(3).fill(0);
  }
}
