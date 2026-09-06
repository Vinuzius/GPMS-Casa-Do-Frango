import { Component, Signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';
import { AppNotification, NotificationsService } from '../../shared/services/notifications.service';

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
  readonly notifications: Signal<AppNotification[]>;
  readonly unreadCount: Signal<number>;

  constructor(private notificationsService: NotificationsService) {
    this.notifications = notificationsService.items;
    this.unreadCount = notificationsService.unreadCount;
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead();
  }
}
