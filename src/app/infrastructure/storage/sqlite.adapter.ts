import { Injectable } from '@angular/core';
import initSqlJs, { Database } from 'sql.js';
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
}

@Injectable({
  providedIn: 'root'
})
export class SqliteAdapter implements StorageInterface {
  private db: Database | null = null;
  private initialized = false;

  reset(): void {
    this.db = null;
    this.initialized = false;
    console.info('[SQLite] Adapter resetado');
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `/sql-wasm.wasm`
      });

      // Tentar carregar banco existente do localStorage
      const savedDb = localStorage.getItem('flashcards:sqlite:db');
      if (savedDb) {
        const binaryString = atob(savedDb);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        this.db = new SQL.Database(bytes);
        console.info('[SQLite] Banco carregado do localStorage');
      } else {
        this.db = new SQL.Database();
        this.createTables();
        console.info('[SQLite] Novo banco criado');
      }

      this.initialized = true;
    } catch (error) {
      console.error('[SQLite] Erro ao inicializar:', error);
      throw error;
    }
  }

  private createTables(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        tags TEXT NOT NULL,
        state TEXT NOT NULL,
        interval INTEGER NOT NULL,
        easeFactor REAL NOT NULL,
        repetitions INTEGER NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        nextReviewDate INTEGER NOT NULL
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS card_options (
        id TEXT NOT NULL,
        optionId TEXT NOT NULL,
        text TEXT NOT NULL,
        isCorrect INTEGER NOT NULL,
        optionOrder INTEGER NOT NULL,
        PRIMARY KEY (id, optionId),
        FOREIGN KEY (id) REFERENCES cards(id)
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS attempts (
        id TEXT NOT NULL,
        attemptId TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        quality INTEGER NOT NULL,
        elapsedTime INTEGER NOT NULL,
        wasCorrect INTEGER NOT NULL,
        userAnswer TEXT,
        easeFactorBefore REAL NOT NULL,
        easeFactorAfter REAL NOT NULL,
        intervalBefore INTEGER NOT NULL,
        intervalAfter INTEGER NOT NULL,
        PRIMARY KEY (id, attemptId),
        FOREIGN KEY (id) REFERENCES cards(id)
      );
    `);

    this.persist();
    console.info('[SQLite] Tabelas criadas');
  }

  async saveCard(card: Card): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    const stored = this.mapCardToStorage(card);

    // Verificar se card existe
    const existing = this.db.exec(
      'SELECT id FROM cards WHERE id = ?',
      [stored.id]
    );

    if (existing.length > 0 && existing[0].values.length > 0) {
      // Update
      this.db.run(
        `UPDATE cards SET
          title = ?, question = ?, answer = ?, tags = ?,
          state = ?, interval = ?, easeFactor = ?, repetitions = ?,
          updatedAt = ?, nextReviewDate = ?
        WHERE id = ?`,
        [
          stored.title,
          stored.question,
          stored.answer,
          JSON.stringify(stored.tags),
          stored.state,
          stored.interval,
          stored.easeFactor,
          stored.repetitions,
          stored.updatedAt,
          stored.nextReviewDate,
          stored.id
        ]
      );

      // Limpar options e attempts antigos
      this.db.run('DELETE FROM card_options WHERE id = ?', [stored.id]);
      this.db.run('DELETE FROM attempts WHERE id = ?', [stored.id]);
    } else {
      // Insert
      this.db.run(
        `INSERT INTO cards
          (id, title, question, answer, tags, state, interval, easeFactor, repetitions, createdAt, updatedAt, nextReviewDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stored.id,
          stored.title,
          stored.question,
          stored.answer,
          JSON.stringify(stored.tags),
          stored.state,
          stored.interval,
          stored.easeFactor,
          stored.repetitions,
          stored.createdAt,
          stored.updatedAt,
          stored.nextReviewDate
        ]
      );
    }

    // Salvar options
    if (stored.options) {
      for (const option of stored.options) {
        this.db.run(
          `INSERT INTO card_options
            (id, optionId, text, isCorrect, optionOrder)
          VALUES (?, ?, ?, ?, ?)`,
          [stored.id, option.id, option.text, option.isCorrect ? 1 : 0, option.order]
        );
      }
    }

    // Salvar attempts
    for (let i = 0; i < stored.attempts.length; i++) {
      const attempt = stored.attempts[i];
      this.db.run(
        `INSERT INTO attempts
          (id, attemptId, timestamp, quality, elapsedTime, wasCorrect, userAnswer,
           easeFactorBefore, easeFactorAfter, intervalBefore, intervalAfter)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stored.id,
          `${stored.id}:${i}`,
          attempt.timestamp,
          attempt.quality,
          attempt.elapsedTime,
          attempt.wasCorrect ? 1 : 0,
          attempt.userAnswer || null,
          attempt.easeFactorBefore,
          attempt.easeFactorAfter,
          attempt.intervalBefore,
          attempt.intervalAfter
        ]
      );
    }

    this.persist();
    console.info(`[SQLite] Card ${card.id.value} salvo`);
  }

  async loadCard(id: CardId): Promise<Card | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    const result = this.db.exec(
      'SELECT * FROM cards WHERE id = ?',
      [id.value]
    );

    if (result.length === 0 || result[0].values.length === 0) return null;

    const row = result[0].values[0];
    const stored = this.rowToStoredCard(row, result[0].columns);
    return this.mapStorageToCard(stored);
  }

  async loadAllCards(): Promise<Card[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    const result = this.db.exec('SELECT * FROM cards ORDER BY updatedAt DESC');
    if (result.length === 0) return [];

    const cards: Card[] = [];
    for (const row of result[0].values) {
      const stored = this.rowToStoredCard(row, result[0].columns);
      cards.push(this.mapStorageToCard(stored));
    }

    return cards;
  }

  async deleteCard(id: CardId): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    this.db.run('DELETE FROM card_options WHERE id = ?', [id.value]);
    this.db.run('DELETE FROM attempts WHERE id = ?', [id.value]);
    this.db.run('DELETE FROM cards WHERE id = ?', [id.value]);

    this.persist();
    console.info(`[SQLite] Card ${id.value} deletado`);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private persist(): void {
    if (!this.db) return;
    const data = this.db.export();

    // Converter Uint8Array para base64 sem usar apply (evita stack overflow)
    let binaryString = '';
    const chunkSize = 8192; // Processar em chunks para evitar stack overflow
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.subarray(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk) as any);
    }

    const base64 = btoa(binaryString);
    localStorage.setItem('flashcards:sqlite:db', base64);
    console.info(`[SQLite] 💾 Banco persistido (${base64.length} bytes)`);
  }

  private rowToStoredCard(row: any[], columns: string[]): StoredCard {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });

    // Carregar options
    let options: StoredOption[] = [];
    if (this.db) {
      const optResult = this.db.exec(
        'SELECT * FROM card_options WHERE id = ? ORDER BY optionOrder',
        [obj.id]
      );
      if (optResult.length > 0) {
        options = optResult[0].values.map(r => ({
          id: r[1] as string,
          text: r[2] as string,
          isCorrect: (r[3] as number) === 1,
          order: r[4] as number
        }));
      }
    }

    // Carregar attempts
    let attempts: StoredAttempt[] = [];
    if (this.db) {
      const attResult = this.db.exec(
        'SELECT * FROM attempts WHERE id = ? ORDER BY timestamp',
        [obj.id]
      );
      if (attResult.length > 0) {
        attempts = attResult[0].values.map(r => ({
          timestamp: r[2] as number,
          quality: r[3] as number,
          elapsedTime: r[4] as number,
          wasCorrect: (r[5] as number) === 1,
          userAnswer: r[6] as string | undefined,
          easeFactorBefore: r[7] as number,
          easeFactorAfter: r[8] as number,
          intervalBefore: r[9] as number,
          intervalAfter: r[10] as number
        }));
      }
    }

    return {
      id: obj.id,
      title: obj.title,
      question: obj.question,
      answer: obj.answer,
      options,
      tags: JSON.parse(obj.tags),
      state: obj.state,
      interval: obj.interval,
      easeFactor: obj.easeFactor,
      repetitions: obj.repetitions,
      attempts,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      nextReviewDate: obj.nextReviewDate
    };
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
      nextReviewDate: card.nextReviewDate.getTime()
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
      nextReviewDate: new Date(stored.nextReviewDate)
    });
  }
}
