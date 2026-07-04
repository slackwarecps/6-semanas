import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../../features/flashcard/domain/entities/card.entity';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [CommonModule, MarkdownPipe],
  templateUrl: './card-display.component.html',
  styleUrls: ['./card-display.component.scss']
})
export class CardDisplayComponent {
  @Input({ required: true }) card!: Card;
  @Input() showAnswer = false;
  @Input() selectedOptionId: string | null = null;

  isSelected(optionId: string): boolean {
    return this.selectedOptionId === optionId;
  }
}
