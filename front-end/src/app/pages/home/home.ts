import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';

@Component({
  selector: 'app-home',
  imports: [
    ...SHARED_IMPORTS,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  promo = {
    title: 'Promoção do Dia',
    subtitle: '15% de desconto em frango',
    badge: 'oferta especial'
  };

  menuDoDia = [
    { name: 'Frango Assado', price: 'R$ 32,90', tag: 'Mais vendido' },
    { name: 'Frango à Parmegiana', price: 'R$ 39,90', tag: 'Especial do Chef' },
    { name: 'Fritas com molho', price: 'R$ 18,90', tag: 'Acompanhamento' }
  ];

  categorias = [
    { name: 'Frango', emoji: '🍗' },
    { name: 'Bebidas', emoji: '🥤' },
    { name: 'Porções', emoji: '🍟' },
    { name: 'Sobremesas', emoji: '🍰' }
  ];
}
