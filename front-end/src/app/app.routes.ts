import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Cardapio } from './pages/cardapio/cardapio';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Rota padrão
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'cardapio', component: Cardapio }, // Rota para a página de cardápio
  { path: '**', redirectTo: '/login' } // Rota para páginas não encontradas
];