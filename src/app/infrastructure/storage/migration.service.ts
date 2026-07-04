import { Injectable } from '@angular/core';
import { SqliteAdapter } from './sqlite.adapter';
import { LocalStorageAdapter } from './local-storage.adapter';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  constructor(
    private sqlite: SqliteAdapter,
    private localStorage: LocalStorageAdapter
  ) {}

  async migrateFromLocalStorage(): Promise<void> {
    const CARDS_KEY = 'flashcards:cards:v1';
    const MIGRATION_KEY = 'flashcards:migration:completed';
    const SQLITE_KEY = 'flashcards:sqlite:db';

    // Verificar se SQLite já tem dados
    const sqliteDb = localStorage.getItem(SQLITE_KEY);
    if (sqliteDb) {
      console.info('[Migration] SQLite já tem dados, pulando migração');
      return;
    }

    // Se não há dados nem em localStorage nem em SQLite, só marcar como completo
    const stored = localStorage.getItem(CARDS_KEY);
    if (!stored) {
      console.info('[Migration] Nenhum dado no localStorage para migrar');
      localStorage.setItem(MIGRATION_KEY, 'true');
      return;
    }

    try {
      await this.sqlite.initialize();

      // Parse dos dados antigos
      const cards = JSON.parse(stored);
      console.info(`[Migration] Iniciando migração de ${cards.length} cards...`);

      // Transferir cada card
      for (const card of cards) {
        await this.sqlite.saveCard(this.reconstructCard(card));
      }

      console.info('[Migration] Migração concluída com sucesso');

      // Marcar como concluído
      localStorage.setItem(MIGRATION_KEY, 'true');

      // Limpar localStorage antigo (opcional)
      console.info('[Migration] Dados antigos mantidos no localStorage como backup');
    } catch (error) {
      console.error('[Migration] Erro durante migração:', error);
      throw error;
    }
  }

  private reconstructCard(data: any): any {
    return {
      id: {
        value: data.id
      },
      title: data.title,
      question: data.question,
      answer: data.answer,
      options: data.options?.map((o: any) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
        order: o.order
      })),
      tags: data.tags.map((t: string) => ({ name: t })),
      state: data.state,
      interval: {
        days: data.interval
      },
      easeFactor: {
        value: data.easeFactor
      },
      repetitions: data.repetitions,
      attempts: data.attempts.map((a: any) => ({
        timestamp: new Date(a.timestamp),
        quality: {
          value: a.quality
        },
        elapsedTime: a.elapsedTime,
        wasCorrect: a.wasCorrect,
        userAnswer: a.userAnswer,
        easeFactorBefore: {
          value: a.easeFactorBefore
        },
        easeFactorAfter: {
          value: a.easeFactorAfter
        },
        intervalBefore: {
          days: a.intervalBefore
        },
        intervalAfter: {
          days: a.intervalAfter
        }
      })),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      nextReviewDate: new Date(data.nextReviewDate)
    };
  }
}
