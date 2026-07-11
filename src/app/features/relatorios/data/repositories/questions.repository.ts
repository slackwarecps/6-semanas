import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CardDTO } from '../dtos/card.dto';
import { Question } from '../../domain/question.entity';

@Injectable({ providedIn: 'root' })
export class QuestionsRepository {
  constructor(private readonly http: HttpClient) {}

  async getScenario1Questions(): Promise<Question[]> {
    try {
      const cards = await firstValueFrom(
        this.http.get<CardDTO[]>(`${environment.backendBaseUrl}/cards/scenario/1`),
      );

      if (!cards) return [];

      return cards
        .filter((card) => card.seq !== null)
        .map((card) => ({
          seq: card.seq!,
          id: card.id,
          title: card.title,
          question: card.question,
          answer: card.answer,
          tags: card.tags,
        }))
        .sort((a, b) => a.seq - b.seq);
    } catch (error) {
      console.error('[QuestionsRepository] Erro ao buscar perguntas:', error);
      throw error;
    }
  }

  async getScenario2Questions(): Promise<Question[]> {
    try {
      const cards = await firstValueFrom(
        this.http.get<CardDTO[]>(`${environment.backendBaseUrl}/cards/scenario/2`),
      );

      if (!cards) return [];

      return cards
        .filter((card) => card.seq !== null)
        .map((card) => ({
          seq: card.seq!,
          id: card.id,
          title: card.title,
          question: card.question,
          answer: card.answer,
          tags: card.tags,
        }))
        .sort((a, b) => a.seq - b.seq);
    } catch (error) {
      console.error('[QuestionsRepository] Erro ao buscar perguntas:', error);
      throw error;
    }
  }

  async getScenario3Questions(): Promise<Question[]> {
    return this.getScenarioQuestions(3);
  }

  async getScenario4Questions(): Promise<Question[]> {
    return this.getScenarioQuestions(4);
  }

  async getScenario5Questions(): Promise<Question[]> {
    return this.getScenarioQuestions(5);
  }

  async getScenario6Questions(): Promise<Question[]> {
    return this.getScenarioQuestions(6);
  }

  async getForaDosCenariosQuestions(): Promise<Question[]> {
    try {
      const cards = await firstValueFrom(
        this.http.get<CardDTO[]>(`${environment.backendBaseUrl}/cards/scenario/fora-do-cenario`),
      );

      if (!cards) return [];

      return cards
        .filter((card) => card.seq !== null)
        .map((card) => ({
          seq: card.seq!,
          id: card.id,
          title: card.title,
          question: card.question,
          answer: card.answer,
          tags: card.tags,
        }))
        .sort((a, b) => a.seq - b.seq);
    } catch (error) {
      console.error('[QuestionsRepository] Erro ao buscar perguntas:', error);
      throw error;
    }
  }

  async getUnclassifiedQuestions(): Promise<Question[]> {
    try {
      const cards = await firstValueFrom(
        this.http.get<CardDTO[]>(
          `${environment.backendBaseUrl}/cards/scenario/sem-classificacao`,
        ),
      );

      if (!cards) return [];

      return cards
        .filter((card) => card.seq !== null)
        .map((card) => ({
          seq: card.seq!,
          id: card.id,
          title: card.title,
          question: card.question,
          answer: card.answer,
          tags: card.tags,
        }))
        .sort((a, b) => a.seq - b.seq);
    } catch (error) {
      console.error('[QuestionsRepository] Erro ao buscar perguntas:', error);
      throw error;
    }
  }

  async getAllQuestions(): Promise<Question[]> {
    try {
      const cards = await firstValueFrom(
        this.http.get<CardDTO[]>(`${environment.backendBaseUrl}/cards/todas`),
      );

      if (!cards) return [];

      return cards
        .filter((card) => card.seq !== null)
        .map((card) => ({
          seq: card.seq!,
          id: card.id,
          title: card.title,
          question: card.question,
          answer: card.answer,
          tags: card.tags,
        }))
        .sort((a, b) => a.seq - b.seq);
    } catch (error) {
      console.error('[QuestionsRepository] Erro ao buscar perguntas:', error);
      throw error;
    }
  }

  private async getScenarioQuestions(scenarioNumber: number): Promise<Question[]> {
    try {
      const cards = await firstValueFrom(
        this.http.get<CardDTO[]>(`${environment.backendBaseUrl}/cards/scenario/${scenarioNumber}`),
      );

      if (!cards) return [];

      return cards
        .filter((card) => card.seq !== null)
        .map((card) => ({
          seq: card.seq!,
          id: card.id,
          title: card.title,
          question: card.question,
          answer: card.answer,
          tags: card.tags,
        }))
        .sort((a, b) => a.seq - b.seq);
    } catch (error) {
      console.error('[QuestionsRepository] Erro ao buscar perguntas:', error);
      throw error;
    }
  }
}
