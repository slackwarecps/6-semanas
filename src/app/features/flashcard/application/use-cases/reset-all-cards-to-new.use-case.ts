import { Injectable } from '@angular/core';
import { CardRepository } from '../../data/repositories/card.repository';
import { Card } from '../../domain/entities/card.entity';
import { Interval } from '../../domain/value-objects/interval.value-object';
import { EaseFactor } from '../../domain/value-objects/ease-factor.value-object';

@Injectable({
  providedIn: 'root'
})
export class ResetAllCardsToNewUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(onProgress?: (processed: number, total: number) => void): Promise<number> {
    const allCards = await this.cardRepository.findAll();
    const cards = allCards.filter(card => card.state !== 'New');
    const now = new Date();

    onProgress?.(0, cards.length);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const resetCard = new Card({
        id: card.id,
        seq: card.seq,
        title: card.title,
        question: card.question,
        answer: card.answer,
        options: card.options,
        tags: card.tags,
        state: 'New',
        interval: new Interval(0),
        easeFactor: new EaseFactor(EaseFactor.DEFAULT),
        repetitions: 0,
        attempts: card.attempts,
        createdAt: card.createdAt,
        updatedAt: now,
        nextReviewDate: now,
        explanation: card.explanation,
        tenYearOld: card.tenYearOld
      });

      await this.cardRepository.save(resetCard);
      onProgress?.(i + 1, cards.length);

      // Cede o thread principal a cada iteração para o navegador poder repintar
      // a barra de progresso (save/persist do sql.js são síncronos e pesados).
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    }

    return cards.length;
  }
}
