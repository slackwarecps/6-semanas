import { Injectable } from '@angular/core';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { Card } from '../../../flashcard/domain/entities/card.entity';

@Injectable({
  providedIn: 'root'
})
export class ListAvailableCardsUseCase {
  constructor(private cardRepository: CardRepository) {}

  async execute(): Promise<Card[]> {
    return await this.cardRepository.findAll();
  }
}
