import { Card } from '../../features/flashcard/domain/entities/card.entity';
import { CardId } from '../../features/flashcard/domain/value-objects/card-id.value-object';

export interface StorageInterface {
  saveCard(card: Card): Promise<void>;
  loadCard(id: CardId): Promise<Card | null>;
  loadAllCards(): Promise<Card[]>;
  deleteCard(id: CardId): Promise<void>;
}
