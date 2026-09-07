import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Dashboard } from './pages/dashboard/dashboard';
import { Cardapio } from './pages/cardapio/cardapio';
import { Admin } from './pages/admin/admin';
import { ProductDetail } from './shared/components/product-detail/product-detail';
import { authGuard } from './shared/guards/auth.guard';
import { Carrinho } from './pages/carrinho/carrinho';
import { HistoricoPedidos } from './pages/historico-pedidos/historico-pedidos';
import { Notificacoes } from './pages/notificacoes/notificacoes';
import { PedidosAndamento } from './pages/pedidos-andamento/pedidos-andamento';
import { Perfil } from './pages/perfil/perfil';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Rota padrão
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'cardapio', component: Cardapio, canActivate: [authGuard] }, // Rota para a página de cardápio
  { path: 'cardapio/produto/:id', component: ProductDetail, canActivate: [authGuard] }, // Rota para a página de detalhes do produto
  { path: 'admin', component: Admin, canActivate: [authGuard] },
  { path: 'carrinho', component: Carrinho, canActivate: [authGuard] },
  { path: 'perfil', component: Perfil, canActivate: [authGuard] },
  { path: 'notificacoes', component: Notificacoes, canActivate: [authGuard] },
  { path: 'pedidos', component: PedidosAndamento, canActivate: [authGuard] },
  { path: 'historico-pedidos', component: HistoricoPedidos, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' } // Rota para páginas não encontradas
];