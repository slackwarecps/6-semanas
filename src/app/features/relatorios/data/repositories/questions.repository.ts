import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { CardDTO } from '../dtos/card.dto';
import { Question } from '../../domain/question.entity';

@Injectable({ providedIn: 'root' })
export class QuestionsRepository {
  constructor(private readonly http: HttpClient) {}

  async getScenario1Questions(): Promise<Question[]> {
    const cards = await this.http
      .get<CardDTO[]>(`${environment.backendBaseUrl}/cards/scenario/1`)
      .toPromise();

    if (!cards) return [];

    return cards
      .filter((card) => card.seq !== null)
      .map((card) => ({
        seq: card.seq!,
        id: card.id,
        title: card.title,
        question: card.question,
        answer: card.answer,
      }))
      .sort((a, b) => a.seq - b.seq);
  }
}
