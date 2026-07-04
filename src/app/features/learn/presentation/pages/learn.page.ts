import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  path: string;
  color: string;
}

@Component({
  selector: 'app-learn-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './learn.page.html',
  styleUrls: ['./learn.page.scss']
})
export class LearnPage {
  readonly menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard', color: '#38bdf8' },
    { icon: '🧠', label: 'Estudar', path: '/study', color: '#22c55e' },
    { icon: '➕', label: 'Adicionar', path: '/add-card', color: '#f59e0b' },
    { icon: '📚', label: 'Gerenciar', path: '/browse-cards', color: '#a855f7' },
    { icon: '📥', label: 'Importar', path: '/importar-cards', color: '#ec4899' },
    { icon: '🧪', label: 'Testar IA', path: '/testa-resposta', color: '#64748b' }
  ];
}
