import { Injectable } from '@angular/core';
import { HttpApiAdapter } from '../../../../infrastructure/storage/http-api.adapter';
import { Card } from '../../domain/entities/card.entity';
import { CardId } from '../../domain/value-objects/card-id.value-object';

@Injectable({
  providedIn: 'root'
})
export class CardRepository {
  constructor(private readonly storage: HttpApiAdapter) {}

  async save(card: Card): Promise<void> {
    await this.storage.saveCard(card);
  }

  async findById(id: CardId): Promise<Card | null> {
    return this.storage.loadCard(id);
  }

  async findAll(): Promise<Card[]> {
    return this.storage.loadAllCards();
  }

  async delete(id: CardId): Promise<void> {
    await this.storage.deleteCard(id);
  }

  async count(): Promise<number> {
    const all = await this.storage.loadAllCards();
    return all.length;
  }
}
