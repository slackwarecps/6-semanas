import { Routes } from '@angular/router';
import { AddCardPage } from './features/add-card/presentation/pages/add-card.page';
import { AdminJornadaPage } from './features/admin-jornada/presentation/pages/admin-jornada.page';
import { BrowseCardsPage } from './features/browse-cards/presentation/pages/browse-cards.page';
import { DashboardPage } from './features/dashboard/presentation/pages/dashboard.page';
import { ImportCardsPage } from './features/import-cards/presentation/pages/import-cards.page';
import { JornadaPhasePage } from './features/learn/presentation/pages/jornada-phase.page';
import { LearnPage } from './features/learn/presentation/pages/learn.page';
import { PreparaQuestoesFase1Page } from './features/prepara-questoes-fase1/presentation/pages/prepara-questoes-fase1.page';
import { StudyPage } from './features/study/presentation/pages/study.page';
import { TagCloudPage } from './features/tag-cloud/presentation/pages/tag-cloud.page';
import { TestaRespostaPage } from './features/testa-resposta/presentation/pages/testa-resposta.page';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'study', component: StudyPage },
  { path: 'add-card', component: AddCardPage },
  { path: 'browse-cards', component: BrowseCardsPage },
  { path: 'importar-cards', component: ImportCardsPage },
  { path: 'testa-resposta', component: TestaRespostaPage },
  { path: 'learn', component: LearnPage },
  { path: 'prepara-questoes-fase1', component: PreparaQuestoesFase1Page },
  { path: 'admin/jornada', component: AdminJornadaPage },
  { path: 'learn/jornada/:id', component: JornadaPhasePage },
  { path: 'tag-cloud', component: TagCloudPage },
  { path: '**', redirectTo: 'dashboard' }
];
