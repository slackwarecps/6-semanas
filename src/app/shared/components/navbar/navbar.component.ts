import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SqliteAdapter } from '../../../infrastructure/storage/sqlite.adapter';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  showSettings = false;

  constructor(private readonly sqliteAdapter: SqliteAdapter) {}

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  resetCards(): void {
    const confirmed = confirm(
      '⚠️  Isso vai apagar todos os cartões salvos.\n\nEsta ação não pode ser desfeita. Deseja continuar?'
    );
    if (!confirmed) return;

    localStorage.removeItem('flashcards:sqlite:db');
    localStorage.removeItem('flashcards:cards:v1');
    localStorage.removeItem('flashcards:migration:completed');
    this.sqliteAdapter.reset();
    this.showSettings = false;
    window.location.reload();
  }
}
