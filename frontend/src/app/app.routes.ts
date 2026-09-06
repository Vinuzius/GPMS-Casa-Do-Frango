import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Cardapio } from './pages/cardapio/cardapio';
import { ProductDetail } from './shared/components/product-detail/product-detail';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Rota padrão
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'cardapio', component: Cardapio }, // Rota para a página de cardápio
  { path: 'cardapio/produto/:id', component: ProductDetail }, // Rota para a página de detalhes do produto
  { path: '**', redirectTo: '/login' } // Rota para páginas não encontradas
];