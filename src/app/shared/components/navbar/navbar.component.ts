import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  showResetDialog = false;

  constructor(
    private readonly sqliteAdapter: SqliteAdapter,
    public readonly router: Router
  ) {}

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  resetCards(): void {
    this.showResetDialog = true;
    this.showSettings = false;
  }

  closeResetDialog(): void {
    this.showResetDialog = false;
  }

  confirmReset(): void {
    localStorage.removeItem('flashcards:sqlite:db');
    localStorage.removeItem('flashcards:cards:v1');
    localStorage.removeItem('flashcards:migration:completed');
    this.sqliteAdapter.reset();
    this.showResetDialog = false;
    window.location.reload();
  }
}
