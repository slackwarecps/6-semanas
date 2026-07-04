import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { Tag } from '../../../flashcard/domain/value-objects/tag.value-object';
import { MultipleChoiceOption } from '../../../flashcard/domain/value-objects/multiple-choice-option.value-object';
import { MarkdownParser } from '../../../../infrastructure/markdown-parser/markdown.parser';
import { ParsedCard } from '../../../../infrastructure/markdown-parser/markdown.models';

interface FlashcardsIndex {
  files: string[];
}

@Component({
  selector: 'app-import-cards-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './import-cards.page.html',
  styleUrls: ['./import-cards.page.scss']
})
export class ImportCardsPage {
  isImporting = false;
  totalFound = 0;
  totalImported = 0;
  totalSkipped = 0;
  errorMessage: string | null = null;
  finished = false;

  constructor(
    private readonly http: HttpClient,
    private readonly cardRepository: CardRepository,
    private readonly markdownParser: MarkdownParser,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  async importAll(): Promise<void> {
    this.ngZone.run(() => {
      this.isImporting = true;
      this.finished = false;
      this.errorMessage = null;
      this.totalFound = 0;
      this.totalImported = 0;
      this.totalSkipped = 0;
      this.cdr.markForCheck();
    });

    try {
      const index = await firstValueFrom(
        this.http.get<FlashcardsIndex>('/flashcards/index.json')
      );
      const metadata = await firstValueFrom(
        this.http.get<Record<string, { correctOption: string; explanation: string }>>(
          '/flashcards-metadata.json'
        )
      );

      this.ngZone.run(() => {
        this.totalFound = index.files.length;
        this.cdr.markForCheck();
      });

      const contents = new Map<string, string>();
      for (const fileName of index.files) {
        const content = await firstValueFrom(
          this.http.get(`/flashcards/${encodeURIComponent(fileName)}`, { responseType: 'text' })
        );
        contents.set(fileName, content);
      }

      const parsedCards = this.markdownParser.parseMultiple(contents, metadata);
      const existingCards = await this.cardRepository.findAll();
      const existingTitles = new Set(existingCards.map(card => card.title));

      for (const parsed of parsedCards) {
        if (existingTitles.has(parsed.title)) {
          this.totalSkipped++;
          continue;
        }

        const card = this.buildCard(parsed);
        await this.cardRepository.save(card);
        this.totalImported++;
      }

      this.ngZone.run(() => {
        this.finished = true;
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[ImportCards] Erro ao importar cartões:', err);
      this.ngZone.run(() => {
        this.errorMessage = 'Não foi possível importar os cartões. Verifique o console para detalhes.';
        this.cdr.markForCheck();
      });
    } finally {
      this.ngZone.run(() => {
        this.isImporting = false;
        this.cdr.markForCheck();
      });
    }
  }

  private buildCard(parsed: ParsedCard): Card {
    const options = parsed.options.map(
      (option, index) =>
        new MultipleChoiceOption({
          id: option.id,
          text: option.text,
          isCorrect: option.isCorrect,
          order: index
        })
    );

    const correctOption = options.find(option => option.isCorrect);
    const answer = [
      correctOption ? `Alternativa correta: ${correctOption.id} - ${correctOption.text}` : '',
      parsed.explanation ?? ''
    ]
      .filter(Boolean)
      .join('\n\n');

    return Card.create({
      title: parsed.title,
      question: parsed.question,
      answer,
      options,
      tags: parsed.tags.map(name => new Tag(name))
    });
  }
}
