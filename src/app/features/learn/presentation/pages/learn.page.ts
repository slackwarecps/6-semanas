import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JourneyMapComponent } from '../../../../shared/components/journey-map/journey-map.component';
import { XpPanelComponent } from '../../../../shared/components/xp-panel/xp-panel.component';
import { GetJourneyMapUseCase, JourneyMapItem } from '../../../jornada/application/use-cases/get-journey-map.use-case';
import { JourneyStats } from '../../../jornada/domain/value-objects/journey-stats.value-object';

interface MenuItem {
  icon: string;
  label: string;
  path: string;
  color: string;
}

@Component({
  selector: 'app-learn-page',
  standalone: true,
  imports: [CommonModule, RouterModule, JourneyMapComponent, XpPanelComponent],
  templateUrl: './learn.page.html',
  styleUrls: ['./learn.page.scss']
})
export class LearnPage implements OnInit {
  readonly menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard', color: '#38bdf8' },
    { icon: '🧠', label: 'Estudar', path: '/study', color: '#22c55e' },
    { icon: '➕', label: 'Adicionar', path: '/add-card', color: '#f59e0b' },
    { icon: '📚', label: 'Gerenciar', path: '/browse-cards', color: '#a855f7' },
    { icon: '📥', label: 'Importar', path: '/importar-cards', color: '#ec4899' },
    { icon: '🧪', label: 'Testar IA', path: '/testa-resposta', color: '#64748b' }
  ];

  journeyMapItems: JourneyMapItem[] = [];
  stats?: JourneyStats;
  isLoading = true;

  constructor(
    private getJourneyMapUseCase: GetJourneyMapUseCase,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadJourneyMap();
  }

  async loadJourneyMap(): Promise<void> {
    try {
      this.ngZone.run(() => {
        this.isLoading = true;
        this.cdr.markForCheck();
      });

      const result = await this.getJourneyMapUseCase.execute();

      this.ngZone.run(() => {
        this.journeyMapItems = result.jornadas;
        this.stats = result.stats;
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[LearnPage] Erro ao carregar mapa da jornada:', err);
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }
}
