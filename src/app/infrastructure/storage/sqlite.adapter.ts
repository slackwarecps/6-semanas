import { Injectable } from '@angular/core';
import initSqlJs, { Database } from 'sql.js';
import { Attempt } from '../../features/flashcard/domain/entities/attempt.entity';
import { Card } from '../../features/flashcard/domain/entities/card.entity';
import { CardId } from '../../features/flashcard/domain/value-objects/card-id.value-object';
import { EaseFactor } from '../../features/flashcard/domain/value-objects/ease-factor.value-object';
import { Interval } from '../../features/flashcard/domain/value-objects/interval.value-object';
import { MultipleChoiceOption } from '../../features/flashcard/domain/value-objects/multiple-choice-option.value-object';
import { Quality, QualityValue } from '../../features/flashcard/domain/value-objects/quality.value-object';
import { Tag } from '../../features/flashcard/domain/value-objects/tag.value-object';
import { StorageInterface } from './storage.interface';

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
  seq?: number;
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
  traducao?: string;
  explanation?: string;
  tenYearOld?: string;
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
        this.createTables();
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
        nextReviewDate INTEGER NOT NULL,
        traducao TEXT,
        explanation TEXT,
        tenYearOld TEXT,
        seq INTEGER
      );
    `);

    // Executa migrações dinâmicas das novas colunas para o banco existente
    try {
      this.db.run('ALTER TABLE cards ADD COLUMN traducao TEXT;');
      console.info('[SQLite Migration] Coluna traducao adicionada à tabela cards.');
    } catch (e) {
      // Ignora se a coluna já existe
    }

    try {
      this.db.run('ALTER TABLE cards ADD COLUMN explanation TEXT;');
      console.info('[SQLite Migration] Coluna explanation adicionada à tabela cards.');
    } catch (e) {
      // Ignora se a coluna já existe
    }

    try {
      this.db.run('ALTER TABLE cards ADD COLUMN tenYearOld TEXT;');
      console.info('[SQLite Migration] Coluna tenYearOld adicionada à tabela cards.');
    } catch (e) {
      // Ignora se a coluna já existe
    }

    try {
      this.db.run('ALTER TABLE cards ADD COLUMN seq INTEGER;');
      console.info('[SQLite Migration] Coluna seq adicionada à tabela cards.');
    } catch (e) {
      // Ignora se a coluna já existe
    }

    this.db.run(`
      CREATE TABLE IF NOT EXISTS card_seq_counter (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        nextValue INTEGER NOT NULL DEFAULT 1
      );
    `);
    this.db.run('INSERT OR IGNORE INTO card_seq_counter (id, nextValue) VALUES (1, 1);');
    this.backfillCardSeq();

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

    this.db.run(`
      CREATE TABLE IF NOT EXISTS jornadas (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        ativa INTEGER NOT NULL DEFAULT 0,
        ordem INTEGER NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS jornada_perguntas (
        jornadaId TEXT NOT NULL,
        cardId TEXT NOT NULL,
        ordem INTEGER NOT NULL,
        PRIMARY KEY (jornadaId, cardId),
        FOREIGN KEY (jornadaId) REFERENCES jornadas(id),
        FOREIGN KEY (cardId) REFERENCES cards(id)
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS jornada_progresso (
        jornadaId TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        bestErrors INTEGER,
        completedAt INTEGER,
        FOREIGN KEY (jornadaId) REFERENCES jornadas(id)
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS learn_stats (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        totalXp INTEGER NOT NULL DEFAULT 0
      );
    `);

    this.db.run(`
      INSERT OR IGNORE INTO learn_stats (id, totalXp) VALUES (1, 0);
    `);

    this.persist();
    console.info('[SQLite] Tabelas criadas');
  }

  // Atribui um seq numérico e estável para cards antigos que ainda não tenham um
  // (migração de banco pré-existente), continuando a partir do contador global.
  private backfillCardSeq(): void {
    if (!this.db) return;

    const pending = this.db.exec(
      'SELECT id FROM cards WHERE seq IS NULL ORDER BY createdAt ASC, id ASC'
    );
    if (pending.length === 0 || pending[0].values.length === 0) return;

    const counterResult = this.db.exec('SELECT nextValue FROM card_seq_counter WHERE id = 1');
    let nextValue = counterResult.length > 0 ? (counterResult[0].values[0][0] as number) : 1;

    for (const row of pending[0].values) {
      const id = row[0] as string;
      this.db.run('UPDATE cards SET seq = ? WHERE id = ?', [nextValue, id]);
      nextValue++;
    }

    this.db.run('UPDATE card_seq_counter SET nextValue = ? WHERE id = 1', [nextValue]);
    console.info(`[SQLite Migration] seq atribuído a ${pending[0].values.length} card(s) existente(s).`);
  }

  private nextCardSeq(): number {
    if (!this.db) return 1;

    const result = this.db.exec('SELECT nextValue FROM card_seq_counter WHERE id = 1');
    const nextValue = result.length > 0 ? (result[0].values[0][0] as number) : 1;
    this.db.run('UPDATE card_seq_counter SET nextValue = ? WHERE id = 1', [nextValue + 1]);
    return nextValue;
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
        updatedAt = ?, nextReviewDate = ?, traducao = ?, explanation = ?, tenYearOld = ?
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
          stored.traducao || null,
          stored.explanation || null,
          stored.tenYearOld || null,
          stored.id
        ]
      );

      // Limpar options e attempts antigos
      this.db.run('DELETE FROM card_options WHERE id = ?', [stored.id]);
      this.db.run('DELETE FROM attempts WHERE id = ?', [stored.id]);
    } else {
      // Insert
      const seq = this.nextCardSeq();
      this.db.run(
        `INSERT INTO cards
          (id, title, question, answer, tags, state, interval, easeFactor, repetitions, createdAt, updatedAt, nextReviewDate, traducao, explanation, tenYearOld, seq)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          stored.nextReviewDate,
          stored.traducao || null,
          stored.explanation || null,
          stored.tenYearOld || null,
          seq
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

    const result = this.db.exec('SELECT * FROM cards ORDER BY seq ASC');
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
      seq: obj.seq ?? undefined,
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
      nextReviewDate: obj.nextReviewDate,
      traducao: obj.traducao || undefined,
      explanation: obj.explanation || undefined,
      tenYearOld: obj.tenYearOld || undefined
    };
  }

  private mapCardToStorage(card: Card): StoredCard {
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

  private mapStorageToCard(stored: StoredCard): Card {
    return new Card({
      id: new CardId(stored.id),
      seq: stored.seq,
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
      traducao: stored.traducao,
      explanation: stored.explanation,
      tenYearOld: stored.tenYearOld
    });
  }

  async saveJornada(jornada: { id: string; nome: string; ativa: boolean; ordem: number; createdAt: Date; updatedAt: Date }, cardIds: string[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    const existing = this.db.exec(
      'SELECT id FROM jornadas WHERE id = ?',
      [jornada.id]
    );

    const ativaVal = jornada.ativa ? 1 : 0;
    const createdVal = jornada.createdAt.getTime();
    const updatedVal = jornada.updatedAt.getTime();

    if (existing.length > 0 && existing[0].values.length > 0) {
      this.db.run(
        `UPDATE jornadas SET nome = ?, ativa = ?, ordem = ?, updatedAt = ? WHERE id = ?`,
        [jornada.nome, ativaVal, jornada.ordem, updatedVal, jornada.id]
      );
    } else {
      this.db.run(
        `INSERT INTO jornadas (id, nome, ativa, ordem, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
        [jornada.id, jornada.nome, ativaVal, jornada.ordem, createdVal, updatedVal]
      );
    }

    this.db.run('DELETE FROM jornada_perguntas WHERE jornadaId = ?', [jornada.id]);
    for (let i = 0; i < cardIds.length; i++) {
      this.db.run(
        `INSERT INTO jornada_perguntas (jornadaId, cardId, ordem) VALUES (?, ?, ?)`,
        [jornada.id, cardIds[i], i]
      );
    }

    this.persist();
    console.info(`[SQLite] Jornada ${jornada.id} salva com ${cardIds.length} cards`);
  }

  async loadAllJornadas(): Promise<any[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    const result = this.db.exec('SELECT * FROM jornadas ORDER BY ordem ASC');
    if (result.length === 0) return [];

    return result[0].values.map(row => {
      const obj: any = {};
      result[0].columns.forEach((col, idx) => {
        obj[col.toLowerCase()] = row[idx];
      });
      return {
        id: obj.id,
        nome: obj.nome,
        ativa: obj.ativa === 1,
        ordem: Number(obj.ordem),
        createdAt: new Date(obj.createdat || obj.createdAt),
        updatedAt: new Date(obj.updatedat || obj.updatedAt)
      };
    });
  }

  async loadJornadaById(id: string): Promise<any | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    const result = this.db.exec('SELECT * FROM jornadas WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;

    const row = result[0].values[0];
    const obj: any = {};
    result[0].columns.forEach((col, idx) => {
      obj[col.toLowerCase()] = row[idx];
    });

    return {
      id: obj.id,
      nome: obj.nome,
      ativa: obj.ativa === 1,
      ordem: Number(obj.ordem),
      createdAt: new Date(obj.createdat || obj.createdAt),
      updatedAt: new Date(obj.updatedat || obj.updatedAt)
    };
  }

  async loadJornadaCardIds(id: string): Promise<string[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    const result = this.db.exec('SELECT cardId FROM jornada_perguntas WHERE jornadaId = ? ORDER BY ordem ASC', [id]);
    if (result.length === 0) return [];

    return result[0].values.map(row => row[0] as string);
  }

  async deleteJornada(id: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    this.db.run('DELETE FROM jornada_perguntas WHERE jornadaId = ?', [id]);
    this.db.run('DELETE FROM jornada_progresso WHERE jornadaId = ?', [id]);
    this.db.run('DELETE FROM jornadas WHERE id = ?', [id]);

    this.persist();
    console.info(`[SQLite] Jornada ${id} deletada`);
  }

  async getJornadaProgress(id: string): Promise<any | null> {
    await this.ensureInitialized();
    if (!this.db) return null;

    const result = this.db.exec('SELECT * FROM jornada_progresso WHERE jornadaId = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;

    const row = result[0].values[0];
    const obj: any = {};
    result[0].columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });

    return {
      jornadaId: obj.jornadaId,
      status: obj.status,
      bestErrors: obj.bestErrors !== null ? obj.bestErrors : null,
      completedAt: obj.completedAt !== null ? new Date(obj.completedAt) : null
    };
  }

  async upsertJornadaProgress(row: { jornadaId: string; status: string; bestErrors: number | null; completedAt: Date | null }): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    const existing = this.db.exec('SELECT jornadaId FROM jornada_progresso WHERE jornadaId = ?', [row.jornadaId]);
    const bestErrorsVal = row.bestErrors !== null ? row.bestErrors : null;
    const completedAtVal = row.completedAt !== null ? row.completedAt.getTime() : null;

    if (existing.length > 0 && existing[0].values.length > 0) {
      this.db.run(
        `UPDATE jornada_progresso SET status = ?, bestErrors = ?, completedAt = ? WHERE jornadaId = ?`,
        [row.status, bestErrorsVal, completedAtVal, row.jornadaId]
      );
    } else {
      this.db.run(
        `INSERT INTO jornada_progresso (jornadaId, status, bestErrors, completedAt) VALUES (?, ?, ?, ?)`,
        [row.jornadaId, row.status, bestErrorsVal, completedAtVal]
      );
    }

    this.persist();
    console.info(`[SQLite] Progresso da Jornada ${row.jornadaId} atualizado para ${row.status}`);
  }

  async getTotalXp(): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) return 0;

    const result = this.db.exec('SELECT totalXp FROM learn_stats WHERE id = 1');
    if (result.length === 0 || result[0].values.length === 0) return 0;

    return result[0].values[0][0] as number;
  }

  async addXp(amount: number): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) return;

    const currentXp = await this.getTotalXp();
    const newXp = currentXp + amount;

    this.db.run('UPDATE learn_stats SET totalXp = ? WHERE id = 1', [newXp]);
    this.persist();
    console.info(`[SQLite] Adicionado ${amount} XP. Novo total: ${newXp}`);
  }
}
