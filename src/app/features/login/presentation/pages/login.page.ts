import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { ActiveUserService } from '../../../../infrastructure/http/active-user.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  private router = inject(Router);
  private authService = inject(AuthService);
  private activeUserService = inject(ActiveUserService);

  username = signal('');
  password = signal('');
  errorMessage = signal('');

  onLogin(event: Event) {
    event.preventDefault();
    if (this.username() === 'admin' && this.password() === 'Facil123') {
      this.errorMessage.set('');
      this.activeUserService.setActiveUser(this.username());
      this.authService.login();
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set('Credenciais inválidas. Tente novamente.');
    }
  }
}
