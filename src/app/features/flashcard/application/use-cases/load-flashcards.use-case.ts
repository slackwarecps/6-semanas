import { Injectable } from '@angular/core';
import { CardRepository } from '../../data/repositories/card.repository';
import { Card } from '../../domain/entities/card.entity';

@Injectable({
  providedIn: 'root'
})
export class LoadFlashcardsUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(): Promise<Card[]> {
    return this.cardRepository.findAll();
  }
}
