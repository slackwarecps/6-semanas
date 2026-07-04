import { Injectable } from '@angular/core';
import { ISRSCalculator } from '../../features/flashcard/domain/services/srs-calculator.interface';
import { Quality } from '../../features/flashcard/domain/value-objects/quality.value-object';
import { Interval } from '../../features/flashcard/domain/value-objects/interval.value-object';
import { EaseFactor } from '../../features/flashcard/domain/value-objects/ease-factor.value-object';
import { ReviewState } from '../../features/flashcard/domain/entities/card.entity';

@Injectable({
  providedIn: 'root'
})
export class SRSCalculator implements ISRSCalculator {
  
  calculateNextInterval(
    quality: Quality,
    currentInterval: Interval,
    repetitions: number,
    easeFactor: EaseFactor
  ): Interval {
    // Se quality < 3 (Again ou Hard de erro), resetar para Learning (1 dia)
    if (quality.value < 3) {
      return new Interval(1);
    }

    // Primeira revisão: 1 dia
    if (repetitions === 0) {
      return new Interval(1);
    }

    // Segunda revisão: 3 dias
    if (repetitions === 1) {
      return new Interval(3);
    }

    // Subsequentes: intervalo anterior * easeFactor
    const nextDays = Math.ceil(currentInterval.days * easeFactor.value);
    return new Interval(Math.max(1, nextDays)); // Mínimo 1 dia
  }

  calculateNextEaseFactor(
    quality: Quality,
    easeFactor: EaseFactor
  ): EaseFactor {
    /**
     * Fórmula SM-2 de Anki:
     * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
     * 
     * Onde q = quality (1-4). Como a qualidade varia de 1 a 4, vamos mapear para q de 2 a 5 para a fórmula original SM-2 
     * ou usar a especificação exata do SDD do usuário que diz:
     * q = quality (1-4)
     * delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
     */
    const q = quality.value;
    const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    const newEF = easeFactor.value + delta;

    return new EaseFactor(newEF);
  }

  calculateNextReviewDate(interval: Interval): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + interval.days);
    tomorrow.setHours(0, 0, 0, 0); // Zera horas para agendamento diário limpo
    return tomorrow;
  }

  determineCardState(
    quality: Quality,
    currentState: ReviewState,
    repetitions: number
  ): ReviewState {
    if (quality.value < 3) {
      return 'Relearning';
    }

    switch (currentState) {
      case 'New':
        return repetitions < 2 ? 'Learning' : 'Review';

      case 'Learning':
        return repetitions >= 2 ? 'Review' : 'Learning';

      case 'Review':
      case 'Relearning':
        return 'Review';

      default:
        return 'New';
    }
  }
}
