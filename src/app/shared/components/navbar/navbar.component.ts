import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ActiveUserService, KNOWN_USERS } from '../../../infrastructure/http/active-user.service';
import { HttpUserDataService } from '../../../infrastructure/storage/http-user-data.service';

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

  readonly users = KNOWN_USERS;
  readonly activeUser: string;

  constructor(
    private readonly userDataService: HttpUserDataService,
    private readonly activeUserService: ActiveUserService,
    public readonly router: Router
  ) {
    this.activeUser = this.activeUserService.activeUser;
  }

  onUserChange(event: Event): void {
    const user = (event.target as HTMLSelectElement).value;
    if (user === this.activeUser) return;

    this.activeUserService.setActiveUser(user);
    // Reload completo: limpa todos os estados visuais e recarrega as listas
    // de cards já com o novo X-User-Id nas chamadas à API.
    window.location.reload();
  }

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

  async confirmReset(): Promise<void> {
    // Apaga os dados do usuário ativo no backend (cards, jornadas, XP, config)
    await this.userDataService.resetAllData();
    // Remove também os resquícios do banco sql.js legado, se existirem
    localStorage.removeItem('flashcards:sqlite:db');
    localStorage.removeItem('flashcards:cards:v1');
    localStorage.removeItem('flashcards:migration:completed');
    this.showResetDialog = false;
    window.location.reload();
  }
}
