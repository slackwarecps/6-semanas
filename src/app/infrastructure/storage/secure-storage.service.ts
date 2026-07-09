import { Injectable } from '@angular/core';
import SecureLS from 'secure-ls';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private ls = new SecureLS({ encodingType: 'aes' });

  setItem(key: string, value: string): void {
    this.ls.set(key, value);
  }

  getItem(key: string): string | null {
    try {
      const data = this.ls.get(key);
      if (!data && data !== false && data !== 0) {
        // Fallback para dados antigos não criptografados
        const raw = localStorage.getItem(key);
        if (raw !== null) return raw;
      }
      return data !== undefined && data !== null ? String(data) : null;
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    this.ls.remove(key);
  }

  clear(): void {
    this.ls.removeAll();
  }
}
