import { Routes } from '@angular/router';
import { DashboardPage } from './features/dashboard/presentation/pages/dashboard.page';
import { StudyPage } from './features/study/presentation/pages/study.page';
import { AddCardPage } from './features/add-card/presentation/pages/add-card.page';
import { ImportCardsPage } from './features/import-cards/presentation/pages/import-cards.page';
import { BrowseCardsPage } from './features/browse-cards/presentation/pages/browse-cards.page';
import { TestaRespostaPage } from './features/testa-resposta/presentation/pages/testa-resposta.page';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'study', component: StudyPage },
  { path: 'add-card', component: AddCardPage },
  { path: 'browse-cards', component: BrowseCardsPage },
  { path: 'importar-cards', component: ImportCardsPage },
  { path: 'testa-resposta', component: TestaRespostaPage },
  { path: '**', redirectTo: 'dashboard' }
];

