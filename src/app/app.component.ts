import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MigrationService } from './infrastructure/storage/migration.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App implements OnInit {
  protected readonly title = signal('flashcards-app');

  constructor(private migrationService: MigrationService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.migrationService.migrateFromLocalStorage();
    } catch (error) {
      console.error('Erro ao migrar dados:', error);
    }
  }
}
