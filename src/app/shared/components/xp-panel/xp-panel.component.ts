import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JourneyStats } from '../../../features/jornada/domain/value-objects/journey-stats.value-object';

@Component({
  selector: 'app-xp-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xp-panel.component.html',
  styleUrls: ['./xp-panel.component.scss']
})
export class XpPanelComponent {
  @Input() stats!: JourneyStats;

  get progressPercentage(): number {
    if (!this.stats || this.stats.totalJornadasAtivas === 0) return 0;
    return Math.round((this.stats.jornadasCompletadas / this.stats.totalJornadasAtivas) * 100);
  }
}
