import { Injectable } from '@angular/core';
import { CardRepository } from '../../data/repositories/card.repository';
import { Card } from '../../domain/entities/card.entity';

@Injectable({
  providedIn: 'root'
})
export class GetNextCardUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(): Promise<Card | null> {
    const due = await this.executeAll();
    return due[0] ?? null;
  }

  async executeAll(): Promise<Card[]> {
    const cards = await this.cardRepository.findAll();
    return cards
      .filter(card => card.isDue)
      .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
  }
}
