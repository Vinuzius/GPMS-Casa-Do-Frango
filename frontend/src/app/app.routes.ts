import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Dashboard } from './pages/dashboard/dashboard';
import { Cardapio } from './pages/cardapio/cardapio';
import { Admin } from './pages/admin/admin';
import { ProductDetail } from './shared/components/product-detail/product-detail';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Rota padrão
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'cardapio', component: Cardapio, canActivate: [authGuard] }, // Rota para a página de cardápio
  { path: 'cardapio/produto/:id', component: ProductDetail, canActivate: [authGuard] }, // Rota para a página de detalhes do produto
  { path: 'admin', component: Admin, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' } // Rota para páginas não encontradas
];