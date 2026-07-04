import { Injectable } from '@angular/core';
import { CardRepository } from '../../data/repositories/card.repository';
import { Card } from '../../domain/entities/card.entity';

@Injectable({
  providedIn: 'root'
})
export class GetNextCardUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(): Promise<Card | null> {
    const cards = await this.cardRepository.findAll();
    const due = cards
      .filter(card => card.isDue)
      .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime());

    return due[0] ?? null;
  }
}
