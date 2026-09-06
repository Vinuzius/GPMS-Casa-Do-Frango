import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Cardapio } from './pages/cardapio/cardapio';
import { ProductDetail } from './shared/components/product-detail/product-detail';
import { Carrinho } from './pages/carrinho/carrinho';
import { Perfil } from './pages/perfil/perfil';
import { Notificacoes } from './pages/notificacoes/notificacoes';
import { Produtos } from './pages/pedidos/produtos';
import { PedidosAndamento } from './pages/pedidos-andamento/pedidos-andamento';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'cardapio', component: Cardapio }, // Rota para a página de cardápio
  { path: 'cardapio/produto/:id', component: ProductDetail }, // Rota para a página de detalhes do produto
  { path: 'carrinho', component: Carrinho },
  { path: 'perfil', component: Perfil },
  { path: 'notificacoes', component: Notificacoes },
  { path: 'pedidos', component: PedidosAndamento },
  { path: 'pedidos/historico', component: Produtos },
  { path: '**', redirectTo: '/login' }, // Rota para páginas não encontradas
];