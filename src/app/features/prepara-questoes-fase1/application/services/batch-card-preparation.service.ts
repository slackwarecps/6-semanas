import { Injectable } from '@angular/core';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { PerguntaLlmService } from '../../../testa-resposta/data/services/pergunta-llm.service';
import { ClassificaCenarioService } from '../../data/services/classifica-cenario.service';
import { applyClassificationTags, hasScenarioTag } from '../../domain/scenario-tags';

export type BatchPreparationMode = 'preencher' | 'tags-cenario';

export interface BatchPreparationResult {
  logs: string[];
  processed: number;
  total: number;
}

export interface BatchPreparationHandlers {
  onLog?: (message: string) => void;
  onProgress?: (processed: number, total: number) => void;
}

@Injectable({ providedIn: 'root' })
export class BatchCardPreparationService {
  private readonly missingAnswerText = 'Precisa Responder...';

  constructor(
    private readonly cardRepository: CardRepository,
    private readonly perguntaLlmService: PerguntaLlmService,
    private readonly classificaCenarioService: ClassificaCenarioService,
  ) {}

  async processRange(
    cards: Card[],
    startSeq: number,
    endSeq: number,
    callIntervalMs: number,
    shouldCancel: () => boolean,
    onlyMissingAnswers: boolean,
    handlers: BatchPreparationHandlers = {},
    mode: BatchPreparationMode = 'preencher',
  ): Promise<BatchPreparationResult> {
    const start = Math.min(startSeq, endSeq);
    const end = Math.max(startSeq, endSeq);
    const logs: string[] = [`Iniciando lote: range ${start}..${end} (modo: ${mode})`];
    handlers.onLog?.(logs[0]);
    logs.push('Processo iniciado.');
    handlers.onLog?.('Processo iniciado.');

    const pending = cards.filter((card) => {
      const seq = card.seq ?? 0;
      const isInRange = seq >= start && seq <= end;
      if (!isInRange) return false;

      if (mode === 'tags-cenario') {
        return onlyMissingAnswers ? !hasScenarioTag(card.tags) : true;
      }

      const hasMissingAnswer = this.isMissingAnswer(card.answer);
      if (onlyMissingAnswers) return hasMissingAnswer;

      return !card.traducao?.trim() || hasMissingAnswer || !card.explanation?.trim();
    });

    logs.push(`Registros elegíveis: ${pending.length}`);
    handlers.onLog?.(`Registros elegíveis: ${pending.length}`);
    handlers.onProgress?.(0, pending.length);

    for (let i = 0; i < pending.length; i++) {
      if (shouldCancel()) {
        logs.push('Processamento cancelado pelo usuário.');
        handlers.onLog?.('Processamento cancelado pelo usuário.');
        break;
      }

      if (i > 0 && callIntervalMs > 0) {
        logs.push(`Aguardando ${callIntervalMs}ms antes da próxima chamada...`);
        handlers.onLog?.(`Aguardando ${callIntervalMs}ms antes da próxima chamada...`);
        await this.sleep(callIntervalMs);
      }

      if (shouldCancel()) {
        logs.push('Processamento cancelado pelo usuário.');
        handlers.onLog?.('Processamento cancelado pelo usuário.');
        break;
      }

      const card = pending[i];
      logs.push(`Processando card seq=${card.seq ?? '-'} id=${card.id.value}`);
      handlers.onLog?.(`Processando card seq=${card.seq ?? '-'} id=${card.id.value}`);

      if (mode === 'tags-cenario') {
        const classificacao = await this.classificaCenarioService.classificar({
          titulo: card.title,
          pergunta: this.formatQuestionWithOptions(card),
        });

        let dominios = classificacao.dominios || [];
        dominios = dominios.filter((d) => d && d.trim().length > 0);
        if (dominios.length === 0) {
          dominios = ['ForaDosDominios'];
        }

        const updated = this.withTags(
          card,
          applyClassificationTags(card.tags, classificacao.cenario, dominios),
        );
        await this.cardRepository.save(updated);

        const message = `Salvo card seq=${card.seq ?? '-'} → ${classificacao.cenario} | ${dominios.join(', ')}`;
        logs.push(message);
        handlers.onLog?.(message);
        handlers.onProgress?.(i + 1, pending.length);
        continue;
      }

      const result = await this.perguntaLlmService.perguntar({
        pergunta: this.formatQuestionWithOptions(card),
      });

      const [translation, explanation] = this.splitCombinedExplanation(result.explicacao);

      const updated = new Card({
        id: card.id,
        seq: card.seq,
        title: card.title,
        question: card.question,
        answer: result.resposta || card.answer,
        options: card.options,
        tags: card.tags,
        state: card.state,
        interval: card.interval,
        easeFactor: card.easeFactor,
        repetitions: card.repetitions,
        attempts: card.attempts,
        createdAt: card.createdAt,
        updatedAt: new Date(),
        nextReviewDate: card.nextReviewDate,
        traducao: translation || card.traducao,
        explanation: explanation || card.explanation,
        tenYearOld: result.explicacaoCrianca || card.tenYearOld,
        flagged: card.flagged,
      });

      await this.cardRepository.save(updated);
      logs.push(`Salvo card seq=${card.seq ?? '-'} title="${updated.title}"`);
      handlers.onLog?.(`Salvo card seq=${card.seq ?? '-'} title="${updated.title}"`);
      handlers.onProgress?.(i + 1, pending.length);
    }

    logs.push('Lote concluído com sucesso.');
    handlers.onLog?.('Lote concluído com sucesso.');
    return { logs, processed: pending.length, total: pending.length };
  }

  private withTags(card: Card, tags: Card['tags']): Card {
    return new Card({
      id: card.id,
      seq: card.seq,
      title: card.title,
      question: card.question,
      answer: card.answer,
      options: card.options,
      tags,
      state: card.state,
      interval: card.interval,
      easeFactor: card.easeFactor,
      repetitions: card.repetitions,
      attempts: card.attempts,
      createdAt: card.createdAt,
      updatedAt: new Date(),
      nextReviewDate: card.nextReviewDate,
      traducao: card.traducao,
      explanation: card.explanation,
      tenYearOld: card.tenYearOld,
      flagged: card.flagged,
    });
  }

  private isMissingAnswer(answer: string | null | undefined): boolean {
    const normalized = answer?.trim();
    return !normalized || normalized === this.missingAnswerText;
  }

  private formatQuestionWithOptions(card: Card): string {
    if (!card.options?.length) return card.question;
    const optionLines = [...card.options]
      .sort((a, b) => a.order - b.order)
      .map((option) => `[ ] ${option.id} - ${option.text}`)
      .join('\n');
    return `${card.question}\n\n${optionLines}`;
  }

  private splitCombinedExplanation(text: string): [string, string] {
    const separator = '\n---\n';
    const index = text.indexOf(separator);
    if (index === -1) return ['', text.trim()];
    return [text.slice(0, index).trim(), text.slice(index + separator.length).trim()];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
