import { Quality } from '../value-objects/quality.value-object';
import { Interval } from '../value-objects/interval.value-object';
import { EaseFactor } from '../value-objects/ease-factor.value-object';
import { ReviewState } from '../entities/card.entity';

export interface ISRSCalculator {
  calculateNextInterval(
    quality: Quality,
    currentInterval: Interval,
    repetitions: number,
    easeFactor: EaseFactor
  ): Interval;

  calculateNextEaseFactor(quality: Quality, easeFactor: EaseFactor): EaseFactor;

  calculateNextReviewDate(interval: Interval): Date;

  determineCardState(
    quality: Quality,
    currentState: ReviewState,
    repetitions: number
  ): ReviewState;
}
