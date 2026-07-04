import { Injectable } from '@angular/core';
import { CardRepository } from '../../data/repositories/card.repository';
import { Card } from '../../domain/entities/card.entity';
import { Attempt } from '../../domain/entities/attempt.entity';
import { Quality, QualityValue } from '../../domain/value-objects/quality.value-object';
import { SRSCalculator } from '../../../../infrastructure/srs-algorithm/srs.calculator';

export interface RecordCardAttemptInput {
  card: Card;
  quality: QualityValue;
  elapsedTime: number;
  wasCorrect: boolean;
  userAnswer?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecordCardAttemptUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly srsCalculator: SRSCalculator
  ) {}

  async execute(input: RecordCardAttemptInput): Promise<Card> {
    const { card } = input;
    const quality = new Quality(input.quality);

    const nextInterval = this.srsCalculator.calculateNextInterval(
      quality,
      card.interval,
      card.repetitions,
      card.easeFactor
    );
    const nextEaseFactor = this.srsCalculator.calculateNextEaseFactor(quality, card.easeFactor);
    const nextState = this.srsCalculator.determineCardState(quality, card.state, card.repetitions);
    const nextReviewDate = this.srsCalculator.calculateNextReviewDate(nextInterval);

    const attempt = new Attempt({
      timestamp: new Date(),
      quality,
      elapsedTime: input.elapsedTime,
      wasCorrect: input.wasCorrect,
      userAnswer: input.userAnswer,
      easeFactorBefore: card.easeFactor,
      easeFactorAfter: nextEaseFactor,
      intervalBefore: card.interval,
      intervalAfter: nextInterval
    });

    const updatedCard = new Card({
      id: card.id,
      title: card.title,
      question: card.question,
      answer: card.answer,
      options: card.options,
      tags: card.tags,
      state: nextState,
      interval: nextInterval,
      easeFactor: nextEaseFactor,
      repetitions: card.repetitions + 1,
      attempts: [...card.attempts, attempt],
      createdAt: card.createdAt,
      updatedAt: new Date(),
      nextReviewDate
    });

    await this.cardRepository.save(updatedCard);
    return updatedCard;
  }
}
