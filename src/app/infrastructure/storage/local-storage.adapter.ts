import { Injectable } from '@angular/core';
import { StorageInterface } from './storage.interface';
import { Card } from '../../features/flashcard/domain/entities/card.entity';
import { CardId } from '../../features/flashcard/domain/value-objects/card-id.value-object';
import { MultipleChoiceOption } from '../../features/flashcard/domain/value-objects/multiple-choice-option.value-object';
import { Tag } from '../../features/flashcard/domain/value-objects/tag.value-object';
import { Interval } from '../../features/flashcard/domain/value-objects/interval.value-object';
import { EaseFactor } from '../../features/flashcard/domain/value-objects/ease-factor.value-object';
import { Attempt } from '../../features/flashcard/domain/entities/attempt.entity';
import { Quality, QualityValue } from '../../features/flashcard/domain/value-objects/quality.value-object';

interface StoredOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface StoredAttempt {
  timestamp: number;
  quality: number;
  elapsedTime: number;
  wasCorrect: boolean;
  userAnswer?: string;
  easeFactorBefore: number;
  easeFactorAfter: number;
  intervalBefore: number;
  intervalAfter: number;
}

interface StoredCard {
  id: string;
  title: string;
  question: string;
  answer: string;
  options?: StoredOption[];
  tags: string[];
  state: 'New' | 'Learning' | 'Review' | 'Relearning';
  interval: number;
  easeFactor: number;
  repetitions: number;
  attempts: StoredAttempt[];
  createdAt: number;
  updatedAt: number;
  nextReviewDate: number;
  explanation?: string;
  tenYearOld?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageAdapter implements StorageInterface {
  private readonly CARDS_KEY = 'flashcards:cards:v1';

  async saveCard(card: Card): Promise<void> {
    const stored = this.mapCardToStorage(card);
    const existing = await this.loadAllStoredCards();
    const index = existing.findIndex(c => c.id === stored.id);
    
    if (index >= 0) {
      existing[index] = stored;
    } else {
      existing.push(stored);
    }
    
    localStorage.setItem(this.CARDS_KEY, JSON.stringify(existing));
    console.info(`[LocalStorage] Card ${card.id.value} salvo no localStorage`);
  }

  async loadCard(id: CardId): Promise<Card | null> {
    const all = await this.loadAllStoredCards();
    const stored = all.find(c => c.id === id.value);
    return stored ? this.mapStorageToCard(stored) : null;
  }

  async loadAllCards(): Promise<Card[]> {
    const allStored = await this.loadAllStoredCards();
    return allStored.map(s => this.mapStorageToCard(s));
  }

  async deleteCard(id: CardId): Promise<void> {
    const existing = await this.loadAllStoredCards();
    const filtered = existing.filter(c => c.id !== id.value);
    localStorage.setItem(this.CARDS_KEY, JSON.stringify(filtered));
    console.info(`[LocalStorage] Card ${id.value} deletado do localStorage`);
  }

  private async loadAllStoredCards(): Promise<StoredCard[]> {
    if (typeof window === 'undefined') return [];
    const cached = localStorage.getItem(this.CARDS_KEY);
    if (!cached) return [];
    try {
      return JSON.parse(cached) as StoredCard[];
    } catch (e) {
      console.error('Falha ao parsear os cards salvos no LocalStorage, limpando cache corrompido:', e);
      return [];
    }
  }

  private mapCardToStorage(card: Card): StoredCard {
    return {
      id: card.id.value,
      title: card.title,
      question: card.question,
      answer: card.answer,
      options: card.options?.map(o => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
        order: o.order
      })),
      tags: card.tags.map(t => t.name),
      state: card.state,
      interval: card.interval.days,
      easeFactor: card.easeFactor.value,
      repetitions: card.repetitions,
      attempts: card.attempts.map(a => ({
        timestamp: a.timestamp.getTime(),
        quality: a.quality.value,
        elapsedTime: a.elapsedTime,
        wasCorrect: a.wasCorrect,
        userAnswer: a.userAnswer,
        easeFactorBefore: a.easeFactorBefore.value,
        easeFactorAfter: a.easeFactorAfter.value,
        intervalBefore: a.intervalBefore.days,
        intervalAfter: a.intervalAfter.days
      })),
      createdAt: card.createdAt.getTime(),
      updatedAt: card.updatedAt.getTime(),
      nextReviewDate: card.nextReviewDate.getTime(),
      explanation: card.explanation,
      tenYearOld: card.tenYearOld
    };
  }

  private mapStorageToCard(stored: StoredCard): Card {
    return new Card({
      id: new CardId(stored.id),
      title: stored.title,
      question: stored.question,
      answer: stored.answer,
      options: stored.options?.map(o => new MultipleChoiceOption(o)) || [],
      tags: stored.tags.map(t => new Tag(t)),
      state: stored.state,
      interval: new Interval(stored.interval),
      easeFactor: new EaseFactor(stored.easeFactor),
      repetitions: stored.repetitions,
      attempts: stored.attempts.map(a => new Attempt({
        timestamp: new Date(a.timestamp),
        quality: new Quality(a.quality as QualityValue),
        elapsedTime: a.elapsedTime,
        wasCorrect: a.wasCorrect,
        userAnswer: a.userAnswer,
        easeFactorBefore: new EaseFactor(a.easeFactorBefore),
        easeFactorAfter: new EaseFactor(a.easeFactorAfter),
        intervalBefore: new Interval(a.intervalBefore),
        intervalAfter: new Interval(a.intervalAfter)
      })),
      createdAt: new Date(stored.createdAt),
      updatedAt: new Date(stored.updatedAt),
      nextReviewDate: new Date(stored.nextReviewDate),
      explanation: stored.explanation,
      tenYearOld: stored.tenYearOld
    });
  }
}
