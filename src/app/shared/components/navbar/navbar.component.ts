import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ActiveUserService } from '../../../infrastructure/http/active-user.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  readonly activeUser: string;

  constructor(
    private readonly activeUserService: ActiveUserService,
    public readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.activeUser = this.activeUserService.activeUser;
  }


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
