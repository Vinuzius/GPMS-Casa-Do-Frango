import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Carrinho } from './pages/carrinho/carrinho';
import { Perfil } from './pages/perfil/perfil';
import { Notificacoes } from './pages/notificacoes/notificacoes';
import { Produtos } from './pages/pedidos/produtos';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'carrinho', component: Carrinho},
  { path: 'perfil', component: Perfil},
  { path: 'notificacoes', component: Notificacoes},
  { path: 'pedidos', component: Produtos}
];