import { computed, Injectable, signal } from '@angular/core';

export type NotificationType = 'order' | 'promotion' | 'account';

export interface AppNotification {
  id: string;
  type: NotificationType;
  icon: string;
  title: string;
  message: string;
  date: string;
  unread: boolean;
}

const NOTIFICATIONS_STORAGE_KEY = 'casa-do-frango-notifications';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'delivery-1048', type: 'order', icon: 'local_shipping',
    title: 'Seu pedido está a caminho', message: 'O pedido #1048 saiu para entrega. Em breve ele chegará até você.', date: 'Hoje, 20:05', unread: true,
  },
  {
    id: 'preparing-1037', type: 'order', icon: 'soup_kitchen',
    title: 'Pedido em preparo', message: 'O pedido #1037 já está sendo preparado com carinho pela nossa equipe.', date: '01 set 2026, 12:28', unread: true,
  },
  {
    id: 'promotion-15', type: 'promotion', icon: 'local_offer',
    title: '15% de desconto no seu próximo pedido', message: 'Use o cupom FRANGO15 e aproveite a oferta até domingo.', date: '30 ago 2026, 10:00', unread: false,
  },
];

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly notifications = signal<AppNotification[]>(this.loadNotifications());
  readonly items = this.notifications.asReadonly();
  readonly unreadCount = computed(() => this.notifications().filter((notification) => notification.unread).length);

  addOrderNotification(orderId: number): void {
    this.notifications.update((items) => [{
      id: `order-${orderId}`,
      type: 'order',
      icon: 'soup_kitchen',
      title: 'Compra finalizada com sucesso',
      message: `O pedido #${orderId} foi recebido e está em preparação.`,
      date: 'Agora',
      unread: true,
    }, ...items]);
    this.persist();
  }

  markAllAsRead(): void {
    this.notifications.update((items) => items.map((notification) => ({
      ...notification,
      unread: false,
    })));
    this.persist();
  }

  private loadNotifications(): AppNotification[] {
    const storedNotifications = sessionStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!storedNotifications) return INITIAL_NOTIFICATIONS;

    try {
      return JSON.parse(storedNotifications) as AppNotification[];
    } catch {
      sessionStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      return INITIAL_NOTIFICATIONS;
    }
  }

  private persist(): void {
    sessionStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(this.notifications()));
  }
}
