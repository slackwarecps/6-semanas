import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JourneyMapItem } from '../../../features/jornada/application/use-cases/get-journey-map.use-case';

@Component({
  selector: 'app-journey-map',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './journey-map.component.html',
  styleUrls: ['./journey-map.component.scss']
})
export class JourneyMapComponent {
  @Input() jornadas: JourneyMapItem[] = [];
}
