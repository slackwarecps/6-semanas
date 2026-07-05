import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-backup-restore-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './backup-restore.page.html',
  styleUrls: ['./backup-restore.page.scss']
})
export class BackupRestorePage {
  
  hasBackup = false;

  constructor() {
    this.checkBackup();
  }

  checkBackup(): void {
    const db = localStorage.getItem('flashcards:sqlite:db');
    this.hasBackup = !!db;
  }

  downloadBackup(): void {
    const base64Db = localStorage.getItem('flashcards:sqlite:db');
    if (!base64Db) {
      alert('Nenhum banco de dados encontrado no navegador!');
      return;
    }

    try {
      // Converte o base64 de volta para binário
      const raw = window.atob(base64Db);
      const u8 = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        u8[i] = raw.charCodeAt(i);
      }
      
      const blob = new Blob([u8], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `flashcards_backup_${new Date().toISOString().slice(0, 10)}.sqlite`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erro ao gerar backup:', err);
      alert('Ocorreu um erro ao gerar o arquivo de backup.');
    }
  }
}
