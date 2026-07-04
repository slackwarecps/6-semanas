import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tag-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag-filter.component.html',
  styleUrls: ['./tag-filter.component.scss']
})
export class TagFilterComponent {
  @Input() availableTags: string[] = [];
  @Input() selectedTags: string[] = [];
  @Output() selectedTagsChange = new EventEmitter<string[]>();

  toggleTag(tag: string): void {
    const updated = this.isSelected(tag)
      ? this.selectedTags.filter(t => t !== tag)
      : [...this.selectedTags, tag];
    this.selectedTagsChange.emit(updated);
  }

  isSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }
}
