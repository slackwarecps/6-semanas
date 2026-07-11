import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JourneyMapItem } from '../../../features/jornada/application/use-cases/get-journey-map.use-case';
import { ResetJornadaUseCase } from '../../../features/jornada/application/use-cases/reset-jornada.use-case';

@Component({
  selector: 'app-journey-map',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './journey-map.component.html',
  styleUrls: ['./journey-map.component.scss']
})
export class JourneyMapComponent {
  @Input() jornadas: JourneyMapItem[] = [];

  constructor(private resetJornadaUseCase: ResetJornadaUseCase) {}

  formatTime(seconds: number | undefined | null): string {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }

  resetJornada(event: Event, jornadaId: string): void {
    event.preventDefault();
    event.stopPropagation();

    const item = this.jornadas.find(j => j.jornada.id === jornadaId);
    if (!item) return;

    // Atualiza otimisticamente na UI
    item.status = 'unlocked';
    item.bestErrors = null;
    item.bestTime = null;
    item.completedWithErrors = false;

    // Salva em background sem bloquear a UI
    this.resetJornadaUseCase.execute(jornadaId).catch(error => {
      console.error('Erro ao resetar jornada:', error);
    });
  }
}
