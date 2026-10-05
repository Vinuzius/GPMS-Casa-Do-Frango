import { Routes }           from '@angular/router';
import { Login }            from './pages/login/login';
import { Registro }         from './pages/registro/registro';
import { Dashboard }        from './pages/dashboard/dashboard';
import { Cardapio }         from './pages/cardapio/cardapio';
import { Admin }            from './pages/admin/admin';
import { ProductDetail }    from './shared/components/product-detail/product-detail';
import { authGuard }        from './shared/guards/auth.guard';
import { adminGuard }       from './shared/guards/admin.guard';
import { Carrinho }         from './pages/carrinho/carrinho';
import { HistoricoPedidos } from './pages/historico-pedidos/historico-pedidos';
import { Notificacoes }     from './pages/notificacoes/notificacoes';
import { PedidosAndamento } from './pages/pedidos-andamento/pedidos-andamento';
import { Perfil }           from './pages/perfil/perfil';

import { ProdutosIndex }    from './pages/admin/produtos/produtos-index/produtos-index';
import { ProdutoShow }      from './pages/admin/produtos/produtos-show/produtos-show';
import { ProdutoForm }      from './pages/admin/produtos/produtos-form/produtos-form';
import { CategoriasIndex }  from './pages/admin/categorias/categorias-index/categorias-index';
import { CategoriaForm }    from './pages/admin/categorias/categorias-form/categorias-form';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Rota padrão
  
  // Rotas públicas (fora do guard)
  { path: 'login',    component: Login },
  { path: 'registro', component: Registro },

  // Rotas protegidas: um guard só para o grupo
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',            component: Dashboard },
      { path: 'cardapio',             component: Cardapio },
      { path: 'cardapio/produto/:id', component: ProductDetail },
      { path: 'admin',                component: Admin, canActivate: [adminGuard] },
      { path: 'carrinho',             component: Carrinho },
      { path: 'perfil',               component: Perfil },
      { path: 'notificacoes',         component: Notificacoes },
      { path: 'pedidos',              component: PedidosAndamento },
      { path: 'historico-pedidos',    component: HistoricoPedidos },
    ],
  },
  {
    path: 'admin/produtos',
    canActivate: [adminGuard],
    children: [
      { path: '',                 component: ProdutosIndex },
      { path: 'novo',             component: ProdutoForm },      // precisa vir ANTES de ':id'
      { path: ':id',              component: ProdutoShow },
      { path: ':id/editar',       component: ProdutoForm },
    ],
  },
  {
    path: 'admin/categorias',
    canActivate: [adminGuard],
    children: [
      { path: '', component: CategoriasIndex },
      { path: 'nova', component: CategoriaForm },
      { path: ':id/editar', component: CategoriaForm },
    ],
  },
  { path: '**', redirectTo: '/login' } // Rota para páginas não encontradas
];