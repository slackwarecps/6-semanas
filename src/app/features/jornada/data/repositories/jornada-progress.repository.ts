import { Injectable } from '@angular/core';
import { HttpJornadaAdapter } from '../../../../infrastructure/storage/http-jornada.adapter';
import { JornadaProgress } from '../../domain/entities/jornada-progress.entity';

@Injectable({
  providedIn: 'root'
})
export class JornadaProgressRepository {
  constructor(private sqliteAdapter: HttpJornadaAdapter) {}

  async getProgress(jornadaId: string): Promise<JornadaProgress | null> {
    const row = await this.sqliteAdapter.getJornadaProgress(jornadaId);
    if (!row) return null;
    return new JornadaProgress({
      jornadaId: row.jornadaId,
      status: row.status,
      bestErrors: row.bestErrors,
      completedAt: row.completedAt,
      currentQuestionIndex: row.currentQuestionIndex,
      currentErrors: row.currentErrors,
      currentLives: row.currentLives,
      lastActiveAt: row.lastActiveAt,
      bestTime: row.bestTime
    });
  }

  async saveProgress(progress: JornadaProgress): Promise<void> {
    await this.sqliteAdapter.upsertJornadaProgress({
      jornadaId: progress.jornadaId,
      status: progress.status,
      bestErrors: progress.bestErrors,
      completedAt: progress.completedAt,
      currentQuestionIndex: progress.currentQuestionIndex,
      currentErrors: progress.currentErrors,
      currentLives: progress.currentLives,
      lastActiveAt: progress.lastActiveAt,
      bestTime: progress.bestTime
    });
  }

  async getTotalXp(): Promise<number> {
    return await this.sqliteAdapter.getTotalXp();
  }

  async addXp(amount: number): Promise<void> {
    await this.sqliteAdapter.addXp(amount);
  }

  async resetAllProgress(): Promise<void> {
    await this.sqliteAdapter.resetJornadaProgress();
  }
}
