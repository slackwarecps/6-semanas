import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import {
  BatchCardPreparationService,
  BatchPreparationMode,
} from '../../application/services/batch-card-preparation.service';
import { HttpConfigAdapter } from '../../../../infrastructure/storage/http-config.adapter';
import { hasScenarioTag } from '../../domain/scenario-tags';

@Component({
  selector: 'app-prepara-questoes-fase1-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './prepara-questoes-fase1.page.html',
  styleUrls: ['./prepara-questoes-fase1.page.scss'],
})
export class PreparaQuestoesFase1Page implements OnInit {
  private readonly missingAnswerText = 'Precisa Responder...';
  cards: Card[] = [];
  isLoading = true;
  isProcessing = false;
  totalCards = 0;
  withoutTranslation = 0;
  withoutAnswer = 0;
  withoutExplanation = 0;
  withoutScenarioTag = 0;
  mode: BatchPreparationMode = 'preencher';
  progressCurrent = 0;
  progressTotal = 0;
  rangeStart = 16;
  rangeEnd = 20;
  callIntervalMs = 1000;
  onlyMissingAnswers = true;
  processingLogs = '';
  lastError: string | null = null;
  readonly chartMaxHeight = 110;
  showConfirmSheet = false;
  isCancelRequested = false;
  defaultModel = 'Carregando...';

  constructor(
    private readonly cardRepository: CardRepository,
    private readonly batchCardPreparationService: BatchCardPreparationService,
    private readonly sqliteAdapter: HttpConfigAdapter,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone,
  ) {}

  async ngOnInit(): Promise<void> {
    const model = await this.sqliteAdapter.getConfig('LLM_QUERY_DEFAULT');
    this.defaultModel = model || 'Não configurado';
    await this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.cdr.markForCheck();
    });

    const cards: Card[] = await this.cardRepository.findAll();

    this.ngZone.run(() => {
      this.cards = cards;
      this.totalCards = cards.length;
      this.withoutTranslation = cards.filter((card) => !card.traducao?.trim()).length;
      this.withoutAnswer = cards.filter((card) => this.isMissingAnswer(card.answer)).length;
      this.withoutExplanation = cards.filter((card) => !card.explanation?.trim()).length;
      this.withoutScenarioTag = cards.filter((card) => !hasScenarioTag(card.tags)).length;
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  async prepareInBatch(): Promise<void> {
    this.showConfirmSheet = true;
    this.cdr.markForCheck();
  }

  async processRangeCards(): Promise<void> {
    this.showConfirmSheet = false;
    this.ngZone.run(() => {
      this.isProcessing = true;
      this.isCancelRequested = false;
      this.progressCurrent = 0;
      this.progressTotal = 0;
      this.lastError = null;
      this.processingLogs = '';
      this.cdr.markForCheck();
    });

    try {
      const result = await this.batchCardPreparationService.processRange(
        this.cards,
        this.rangeStart,
        this.rangeEnd,
        this.callIntervalMs,
        () => this.isCancelRequested,
        this.onlyMissingAnswers,
        {
          onLog: (message: string) => this.appendLog(message),
          onProgress: (processed: number, total: number) => this.updateProgress(processed, total),
        },
        this.mode,
      );

      this.ngZone.run(() => {
        this.processingLogs = result.logs.join('\n');
        this.progressCurrent = result.processed;
        this.progressTotal = result.total;
        this.cdr.markForCheck();
      });
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : 'Erro ao processar cards';
    } finally {
      await this.loadStats();
      this.ngZone.run(() => {
        this.isProcessing = false;
        this.refreshCounters();
        this.cdr.markForCheck();
      });
    }
  }

  private refreshCounters(): void {
    this.totalCards = this.cards.length;
    this.withoutTranslation = this.cards.filter((card) => !card.traducao?.trim()).length;
    this.withoutAnswer = this.cards.filter((card) => this.isMissingAnswer(card.answer)).length;
    this.withoutExplanation = this.cards.filter((card) => !card.explanation?.trim()).length;
    this.withoutScenarioTag = this.cards.filter((card) => !hasScenarioTag(card.tags)).length;
  }

  get onlyPendingLabel(): string {
    return this.mode === 'tags-cenario'
      ? 'Processar apenas as sem tag de cenário'
      : 'Processar apenas as Sem respostas';
  }

  getChartHeight(value: number): number {
    if (!this.totalCards || value <= 0) return 8;
    const ratio = value / this.totalCards;
    return Math.max(8, Math.round(ratio * this.chartMaxHeight));
  }

  private isMissingAnswer(answer: string | null | undefined): boolean {
    const normalized = answer?.trim();
    return !normalized || normalized === this.missingAnswerText;
  }

  confirmBatchProcessing(): void {
    this.showConfirmSheet = false;
    void this.processRangeCards();
  }

  cancelBatchProcessing(): void {
    this.showConfirmSheet = false;
    this.cdr.markForCheck();
  }

  cancelProcessing(): void {
    this.isCancelRequested = true;
    this.processingLogs = `${this.processingLogs}\nCancelamento solicitado pelo usuário.`.trim();
    this.cdr.markForCheck();
  }

  private appendLog(message: string): void {
    this.ngZone.run(() => {
      this.processingLogs = this.processingLogs ? `${this.processingLogs}\n${message}` : message;
      this.cdr.markForCheck();
    });
  }

  private updateProgress(processed: number, total: number): void {
    this.ngZone.run(() => {
      this.progressCurrent = processed;
      this.progressTotal = total;
      this.cdr.markForCheck();
    });
  }
}
