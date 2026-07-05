import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { DashboardStatsDto } from '../../application/dto/dashboard-stats.dto';
import { GetDashboardStatsUseCase } from '../../application/use-cases/get-dashboard-stats.use-case';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  stats: DashboardStatsDto | null = null;
  isLoading = true;

  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.cdr.markForCheck();
    });

    try {
      const stats = await this.getDashboardStatsUseCase.execute();
      this.ngZone.run(() => {
        this.stats = stats;
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[Dashboard] Erro ao carregar estatísticas:', err);
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  goToStudy(): void {
    this.router.navigate(['/study']);
  }

  goToLearn(): void {
    this.router.navigate(['/learn']);
  }

  goToPreparaQuestoesFase1(): void {
    this.router.navigate(['/prepara-questoes-fase1']);
  }
}
