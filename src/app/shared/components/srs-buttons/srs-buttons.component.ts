import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QualityValue } from '../../../features/flashcard/domain/value-objects/quality.value-object';

interface QualityOption {
  value: QualityValue;
  label: string;
}

@Component({
  selector: 'app-srs-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './srs-buttons.component.html',
  styleUrls: ['./srs-buttons.component.scss']
})
export class SrsButtonsComponent {
  @Output() qualitySelected = new EventEmitter<QualityValue>();

  readonly options: QualityOption[] = [
    { value: 1, label: 'Again' },
    { value: 2, label: 'Hard' },
    { value: 3, label: 'Good' },
    { value: 4, label: 'Easy' }
  ];

  select(quality: QualityValue): void {
    this.qualitySelected.emit(quality);
  }
}
