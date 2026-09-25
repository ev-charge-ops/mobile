import type { AppNotification, NotificationPage } from '@/features/notifications/api/notifications-api';

export function buildNotification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: 'n1',
    type: 'CHARGING_COMPLETE',
    title: 'Recarga concluída',
    body: 'Você tem 10 minutos de tolerância para liberar a vaga.',
    data: { sessionId: 's1', chargePointId: 'cp-1', chargePointName: 'Garagem L1 · Vaga 12' },
    readAt: null,
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    ...overrides,
  };
}

export function buildNotificationPage(
  items: AppNotification[],
  overrides: Partial<NotificationPage> = {},
): NotificationPage {
  return {
    items,
    total: items.length,
    page: 1,
    pageSize: 20,
    unreadCount: items.filter((item) => item.readAt == null).length,
    ...overrides,
  };
}
