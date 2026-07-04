import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';
import { Card } from '../../../flashcard/domain/entities/card.entity';
import { Tag } from '../../../flashcard/domain/value-objects/tag.value-object';
import { MultipleChoiceOption } from '../../../flashcard/domain/value-objects/multiple-choice-option.value-object';

interface OptionFormRow {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
}

@Component({
  selector: 'app-add-card-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './add-card.page.html',
  styleUrls: ['./add-card.page.scss']
})
export class AddCardPage {
  title = '';
  question = '';
  answer = '';
  tags = '';
  isMultipleChoice = false;
  correctOptionLetter: 'A' | 'B' | 'C' | 'D' = 'A';
  optionRows: OptionFormRow[] = [
    { letter: 'A', text: '' },
    { letter: 'B', text: '' },
    { letter: 'C', text: '' },
    { letter: 'D', text: '' }
  ];
  isSaving = false;

  constructor(
    private readonly cardRepository: CardRepository,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  async save(): Promise<void> {
    if (!this.title.trim() || !this.question.trim() || !this.answer.trim()) {
      alert('⚠️  Preencha título, pergunta e resposta.');
      return;
    }

    this.ngZone.run(() => {
      this.isSaving = true;
      this.cdr.markForCheck();
    });

    try {
      const tagNames = this.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const options = this.isMultipleChoice
        ? this.optionRows
            .filter(row => row.text.trim().length > 0)
            .map(
              (row, index) =>
                new MultipleChoiceOption({
                  id: row.letter,
                  text: row.text.trim(),
                  isCorrect: row.letter === this.correctOptionLetter,
                  order: index
                })
            )
        : undefined;

      const card = Card.create({
        title: this.title.trim(),
        question: this.question.trim(),
        answer: this.answer.trim(),
        options,
        tags: tagNames.map(name => new Tag(name))
      });

      await this.cardRepository.save(card);
      this.ngZone.run(() => {
        this.resetForm();
        this.cdr.markForCheck();
      });
      this.router.navigate(['/browse-cards']);
    } catch (err) {
      console.error('[AddCard] Erro ao salvar cartão:', err);
      alert('❌ Erro ao salvar cartão');
    } finally {
      this.ngZone.run(() => {
        this.isSaving = false;
        this.cdr.markForCheck();
      });
    }
  }

  private resetForm(): void {
    this.title = '';
    this.question = '';
    this.answer = '';
    this.tags = '';
    this.isMultipleChoice = false;
    this.correctOptionLetter = 'A';
    this.optionRows = [
      { letter: 'A', text: '' },
      { letter: 'B', text: '' },
      { letter: 'C', text: '' },
      { letter: 'D', text: '' }
    ];
  }
}
