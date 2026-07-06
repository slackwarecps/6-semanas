import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiJornada {
  id: string;
  nome: string;
  ativa: boolean;
  ordem: number;
  pontosTentativas: number;
  createdAt: number;
  updatedAt: number;
  cardIds: string[];
}

interface ApiProgresso {
  jornadaId: string;
  status: string;
  bestErrors: number | null;
  completedAt: number | null;
  currentQuestionIndex: number;
  currentErrors: number;
  currentLives: number;
  lastActiveAt: number | null;
  bestTime: number | null;
}

/**
 * Persistência de jornadas, progresso e XP no backend (rotas /jornadas e
 * /learn), substituindo os métodos equivalentes do SqliteAdapter legado.
 * Mantém as mesmas assinaturas para a troca nos repositórios ser transparente
 * (timestamps trafegam como epoch ms e viram Date aqui).
 */
@Injectable({
  providedIn: 'root'
})
export class HttpJornadaAdapter {
  private readonly baseUrl = environment.backendBaseUrl;

  constructor(private readonly http: HttpClient) {}

  // ── Jornadas ───────────────────────────────────────────────────────────

  async saveJornada(
    jornada: { id: string; nome: string; ativa: boolean; ordem: number; pontosTentativas: number; createdAt: Date; updatedAt: Date },
    cardIds: string[]
  ): Promise<void> {
    await firstValueFrom(
      this.http.post<ApiJornada>(`${this.baseUrl}/jornadas`, {
        id: jornada.id,
        nome: jornada.nome,
        ativa: jornada.ativa,
        ordem: jornada.ordem,
        pontosTentativas: jornada.pontosTentativas,
        createdAt: jornada.createdAt.getTime(),
        updatedAt: jornada.updatedAt.getTime(),
        cardIds
      })
    );
  }

  async loadAllJornadas(): Promise<any[]> {
    const dtos = await firstValueFrom(this.http.get<ApiJornada[]>(`${this.baseUrl}/jornadas`));
    return dtos.map(dto => this.mapJornada(dto));
  }

  async loadJornadaById(id: string): Promise<any | null> {
    const dto = await this.getJornadaOrNull(id);
    return dto ? this.mapJornada(dto) : null;
  }

  async loadJornadaCardIds(id: string): Promise<string[]> {
    const dto = await this.getJornadaOrNull(id);
    return dto?.cardIds ?? [];
  }

  async deleteJornada(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/jornadas/${id}`));
  }

  // ── Progresso ──────────────────────────────────────────────────────────

  async getJornadaProgress(id: string): Promise<any | null> {
    try {
      const dto = await firstValueFrom(
        this.http.get<ApiProgresso>(`${this.baseUrl}/jornadas/${id}/progresso`)
      );
      return {
        jornadaId: dto.jornadaId,
        status: dto.status,
        bestErrors: dto.bestErrors,
        completedAt: dto.completedAt !== null ? new Date(dto.completedAt) : null,
        currentQuestionIndex: dto.currentQuestionIndex,
        currentErrors: dto.currentErrors,
        currentLives: dto.currentLives,
        lastActiveAt: dto.lastActiveAt !== null ? new Date(dto.lastActiveAt) : null,
        bestTime: dto.bestTime
      };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async upsertJornadaProgress(row: {
    jornadaId: string;
    status: string;
    bestErrors: number | null;
    completedAt: Date | null;
    currentQuestionIndex?: number;
    currentErrors?: number;
    currentLives?: number;
    lastActiveAt?: Date | null;
    bestTime?: number | null;
  }): Promise<void> {
    await firstValueFrom(
      this.http.put<ApiProgresso>(`${this.baseUrl}/jornadas/${row.jornadaId}/progresso`, {
        jornadaId: row.jornadaId,
        status: row.status,
        bestErrors: row.bestErrors,
        completedAt: row.completedAt ? row.completedAt.getTime() : null,
        currentQuestionIndex: row.currentQuestionIndex ?? 0,
        currentErrors: row.currentErrors ?? 0,
        currentLives: row.currentLives ?? 3,
        lastActiveAt: row.lastActiveAt ? row.lastActiveAt.getTime() : null,
        bestTime: row.bestTime ?? null
      })
    );
  }

  // ── XP / Learn stats ───────────────────────────────────────────────────

  async getTotalXp(): Promise<number> {
    const dto = await firstValueFrom(this.http.get<{ totalXp: number }>(`${this.baseUrl}/learn/xp`));
    return dto.totalXp;
  }

  async addXp(amount: number): Promise<void> {
    await firstValueFrom(this.http.post<{ totalXp: number }>(`${this.baseUrl}/learn/xp`, { amount }));
  }

  async resetJornadaProgress(): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${this.baseUrl}/learn/reset-progress`, {}));
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private async getJornadaOrNull(id: string): Promise<ApiJornada | null> {
    try {
      return await firstValueFrom(this.http.get<ApiJornada>(`${this.baseUrl}/jornadas/${id}`));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private mapJornada(dto: ApiJornada) {
    return {
      id: dto.id,
      nome: dto.nome,
      ativa: dto.ativa,
      ordem: dto.ordem,
      pontosTentativas: dto.pontosTentativas,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt)
    };
  }
}
