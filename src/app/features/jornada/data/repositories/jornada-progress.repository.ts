import { Injectable } from '@angular/core';
import { SqliteAdapter } from '../../../../infrastructure/storage/sqlite.adapter';
import { JornadaProgress } from '../../domain/entities/jornada-progress.entity';

@Injectable({
  providedIn: 'root'
})
export class JornadaProgressRepository {
  constructor(private sqliteAdapter: SqliteAdapter) {}

  async getProgress(jornadaId: string): Promise<JornadaProgress | null> {
    const row = await this.sqliteAdapter.getJornadaProgress(jornadaId);
    if (!row) return null;
    return new JornadaProgress({
      jornadaId: row.jornadaId,
      status: row.status,
      bestErrors: row.bestErrors,
      completedAt: row.completedAt
    });
  }

  async saveProgress(progress: JornadaProgress): Promise<void> {
    await this.sqliteAdapter.upsertJornadaProgress({
      jornadaId: progress.jornadaId,
      status: progress.status,
      bestErrors: progress.bestErrors,
      completedAt: progress.completedAt
    });
  }

  async getTotalXp(): Promise<number> {
    return await this.sqliteAdapter.getTotalXp();
  }

  async addXp(amount: number): Promise<void> {
    await this.sqliteAdapter.addXp(amount);
  }
}
