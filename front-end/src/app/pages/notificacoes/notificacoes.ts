import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';

type NotificationType = 'order' | 'promotion' | 'account';

@Component({
  selector: 'app-notificacoes',
  imports: [
    ...SHARED_IMPORTS,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './notificacoes.html',
  styleUrl: './notificacoes.scss',
})
export class Notificacoes {
  notifications = [
    {
      type: 'order' as NotificationType,
      icon: 'local_shipping',
      title: 'Seu pedido está a caminho',
      message: 'O pedido #1048 saiu para entrega. Em breve ele chegará até você.',
      date: 'Hoje, 20:05',
      unread: true,
    },
    {
      type: 'order' as NotificationType,
      icon: 'soup_kitchen',
      title: 'Pedido em preparo',
      message: 'O pedido #1037 já está sendo preparado com carinho pela nossa equipe.',
      date: '01 set 2026, 12:28',
      unread: true,
    },
    {
      type: 'promotion' as NotificationType,
      icon: 'local_offer',
      title: '15% de desconto no seu próximo pedido',
      message: 'Use o cupom FRANGO15 e aproveite a oferta até domingo.',
      date: '30 ago 2026, 10:00',
      unread: false,
    },
    {
      type: 'order' as NotificationType,
      icon: 'check_circle',
      title: 'Pedido concluído',
      message: 'O pedido #1022 foi finalizado. Obrigado por escolher a Casa do Frango!',
      date: '27 ago 2026, 20:46',
      unread: false,
    },
    {
      type: 'account' as NotificationType,
      icon: 'celebration',
      title: 'Bem-vindo à Casa do Frango',
      message: 'Complete seu perfil e deixe seus próximos pedidos ainda mais rápidos.',
      date: '25 ago 2026, 09:15',
      unread: false,
    },
  ];
}
