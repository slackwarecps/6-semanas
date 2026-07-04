import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { GetDashboardStatsUseCase } from '../../application/use-cases/get-dashboard-stats.use-case';
import { DashboardStatsDto } from '../../application/dto/dashboard-stats.dto';

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
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.isLoading = true;
    try {
      this.stats = await this.getDashboardStatsUseCase.execute();
    } catch (err) {
      console.error('[Dashboard] Erro ao carregar estatísticas:', err);
    } finally {
      this.isLoading = false;
    }
  }

  goToStudy(): void {
    this.router.navigate(['/study']);
  }
}
