export class CardId {
  readonly value: string;

  constructor(value: string) {
    if (!value || !value.trim()) {
      throw new Error('CardId: value não pode ser vazio.');
    }
    this.value = value;
  }

  equals(other: CardId): boolean {
    return this.value === other.value;
  }

  static generate(): CardId {
    return new CardId(crypto.randomUUID());
  }
}
