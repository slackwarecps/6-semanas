import { Injectable } from '@angular/core';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { CardId } from '../../../flashcard/domain/value-objects/card-id.value-object';
import { Jornada } from '../../domain/entities/jornada.entity';
import { JornadaRepository } from '../../data/repositories/jornada.repository';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { JornadaPdfAdapter } from '../../../../infrastructure/adapters/jornada-pdf.adapter';

@Injectable({
  providedIn: 'root'
})
export class ExportJornadaToPdfUseCase {
  constructor(
    private readonly jornadaRepository: JornadaRepository,
    private readonly cardRepository: CardRepository,
    private readonly pdfAdapter: JornadaPdfAdapter,
  ) {}

  async execute(jornadaId: string): Promise<void> {
    const jornada = await this.jornadaRepository.findById(jornadaId);
    if (!jornada) {
      throw new Error(`Jornada com ID ${jornadaId} não encontrada`);
    }

    if (jornada.questionCardIds.length === 0) {
      throw new Error('Jornada não possui cards associados');
    }

    const cards = await Promise.all(
      jornada.questionCardIds.map(cardId => this.cardRepository.findById(new CardId(cardId))),
    );

    const validCards = cards.filter((card: Card | null): card is Card => card !== null && card !== undefined);

    if (validCards.length === 0) {
      throw new Error('Nenhum card válido encontrado para a jornada');
    }

    await this.pdfAdapter.exportToPdf(jornada, validCards);
  }
}
