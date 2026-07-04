import { Injectable } from '@angular/core';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto';

@Injectable({
  providedIn: 'root'
})
export class GetDashboardStatsUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(): Promise<DashboardStatsDto> {
    const cards = await this.cardRepository.findAll();

    const dueToday = cards.filter(card => card.isDue).length;
    const newCards = cards.filter(card => card.state === 'New').length;
    const learningCards = cards.filter(card => card.state === 'Learning').length;
    const reviewCards = cards.filter(card => card.state === 'Review').length;
    const relearningCards = cards.filter(card => card.state === 'Relearning').length;

    const averageEaseFactor = cards.length
      ? cards.reduce((sum, card) => sum + card.easeFactor.value, 0) / cards.length
      : 0;

    return {
      totalCards: cards.length,
      dueToday,
      newCards,
      learningCards,
      reviewCards,
      relearningCards,
      averageEaseFactor: Math.round(averageEaseFactor * 100) / 100
    };
  }
}
