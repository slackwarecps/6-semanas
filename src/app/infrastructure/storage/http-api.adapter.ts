import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Attempt } from '../../features/flashcard/domain/entities/attempt.entity';
import { Card } from '../../features/flashcard/domain/entities/card.entity';
import { CardId } from '../../features/flashcard/domain/value-objects/card-id.value-object';
import { EaseFactor } from '../../features/flashcard/domain/value-objects/ease-factor.value-object';
import { Interval } from '../../features/flashcard/domain/value-objects/interval.value-object';
import { MultipleChoiceOption } from '../../features/flashcard/domain/value-objects/multiple-choice-option.value-object';
import { Quality, QualityValue } from '../../features/flashcard/domain/value-objects/quality.value-object';
import { Tag } from '../../features/flashcard/domain/value-objects/tag.value-object';
import { StorageInterface } from './storage.interface';

// DTOs no formato do backend (rotas /cards), que espelham o StoredCard legado.

interface ApiOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface ApiAttempt {
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

interface ApiCard {
  id: string;
  seq?: number;
  title: string;
  question: string;
  answer: string;
  options?: ApiOption[];
  tags: string[];
  state: 'New' | 'Learning' | 'Review' | 'Relearning';
  interval: number;
  easeFactor: number;
  repetitions: number;
  attempts: ApiAttempt[];
  createdAt: number;
  updatedAt: number;
  nextReviewDate: number;
  traducao?: string;
  explanation?: string;
  tenYearOld?: string;
}

/**
 * Implementação da StorageInterface que persiste os cards no backend
 * (FastAPI + SQLite), em vez do banco sql.js local do navegador.
 *
 * O header `X-User-Id` é adicionado pelo userIdInterceptor, não aqui.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpApiAdapter implements StorageInterface {
  private readonly baseUrl = `${environment.backendBaseUrl}/cards`;

  constructor(private readonly http: HttpClient) {}

  async saveCard(card: Card): Promise<void> {
    await firstValueFrom(this.http.post<ApiCard>(this.baseUrl, this.mapCardToApi(card)));
  }

  async loadCard(id: CardId): Promise<Card | null> {
    try {
      const dto = await firstValueFrom(this.http.get<ApiCard>(`${this.baseUrl}/${id.value}`));
      return this.mapApiToCard(dto);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async loadAllCards(): Promise<Card[]> {
    const dtos = await firstValueFrom(this.http.get<ApiCard[]>(this.baseUrl));
    return dtos.map(dto => this.mapApiToCard(dto));
  }

  async deleteCard(id: CardId): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id.value}`));
  }

  private mapCardToApi(card: Card): ApiCard {
    return {
      id: card.id.value,
      seq: card.seq,
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
      traducao: card.traducao,
      explanation: card.explanation,
      tenYearOld: card.tenYearOld
    };
  }

  private mapApiToCard(dto: ApiCard): Card {
    return new Card({
      id: new CardId(dto.id),
      seq: dto.seq,
      title: dto.title,
      question: dto.question,
      answer: dto.answer,
      options: dto.options?.map(o => new MultipleChoiceOption(o)) || [],
      tags: dto.tags.map(t => new Tag(t)),
      state: dto.state,
      interval: new Interval(dto.interval),
      easeFactor: new EaseFactor(dto.easeFactor),
      repetitions: dto.repetitions,
      attempts: dto.attempts.map(a => new Attempt({
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
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      nextReviewDate: new Date(dto.nextReviewDate),
      traducao: dto.traducao,
      explanation: dto.explanation,
      tenYearOld: dto.tenYearOld
    });
  }
}
