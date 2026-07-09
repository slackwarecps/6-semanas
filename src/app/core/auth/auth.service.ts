import { Injectable, signal, inject } from '@angular/core';
import { SecureStorageService } from '../../infrastructure/storage/secure-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private secureStorage = inject(SecureStorageService);
  
  // Estado reativo simples, inicializado a partir do localStorage seguro
  private isAuthenticatedSignal = signal<boolean>(this.checkInitialState());

  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  private checkInitialState(): boolean {
    return this.secureStorage.getItem('isLoggedIn') === 'true';
  }

  login(): void {
    this.secureStorage.setItem('isLoggedIn', 'true');
    this.isAuthenticatedSignal.set(true);
  }

  logout(): void {
    this.secureStorage.removeItem('isLoggedIn');
    this.isAuthenticatedSignal.set(false);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSignal();
  }
}
