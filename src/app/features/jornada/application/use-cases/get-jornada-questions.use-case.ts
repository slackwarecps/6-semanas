import { Injectable } from '@angular/core';
import { JornadaRepository } from '../../data/repositories/jornada.repository';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { CardId } from '../../../flashcard/domain/value-objects/card-id.value-object';

@Injectable({
  providedIn: 'root'
})
export class GetJornadaQuestionsUseCase {
  constructor(
    private jornadaRepository: JornadaRepository,
    private cardRepository: CardRepository
  ) {}

  async execute(jornadaId: string): Promise<Card[]> {
    const jornada = await this.jornadaRepository.findById(jornadaId);
    if (!jornada) {
      throw new Error(`Jornada com ID ${jornadaId} não encontrada.`);
    }

    const cards: Card[] = [];
    for (const cardId of jornada.questionCardIds) {
      const card = await this.cardRepository.findById(new CardId(cardId));
      if (card) {
        cards.push(card);
      }
    }
    return cards;
  }
}
