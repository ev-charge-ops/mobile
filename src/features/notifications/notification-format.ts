import {
  Ban,
  Building2,
  Clock3,
  CreditCard,
  Hourglass,
  Receipt,
  TriangleAlert,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { colors } from '@/constants/theme';
import type { AppNotification, AppNotificationType } from '@/features/notifications/api/notifications-api';

export type NotificationTone = { icon: LucideIcon; color: string; backgroundColor: string };

const charging = { color: colors.energyText, backgroundColor: colors.energyTint };
const warning = { color: colors.warningText, backgroundColor: colors.warningTint };
const critical = { color: colors.criticalText, backgroundColor: colors.criticalTint };
const info = { color: colors.infoText, backgroundColor: colors.infoTint };
const neutral = { color: colors.textBody, backgroundColor: colors.surfaceInset };

export const notificationTones: Record<AppNotificationType, NotificationTone> = {
  SESSION_ACTIVE: { icon: Zap, ...charging },
  CHARGING_COMPLETE: { icon: Clock3, ...warning },
  IDLE_FEE_STARTED: { icon: TriangleAlert, ...critical },
  PAYMENT_CAPTURED: { icon: Receipt, ...neutral },
  PAYMENT_FAILED: { icon: CreditCard, ...critical },
  SESSION_INTERRUPTED: { icon: Ban, ...critical },
  ORGANIZATION_INVITE: { icon: Building2, ...info },
  QUEUE_TURN: { icon: Hourglass, ...warning },
};

export type NotificationFilter = 'all' | 'charging' | 'condo';

export const notificationFilters: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'charging', label: 'Recargas' },
  { value: 'condo', label: 'Condomínio' },
];

const condoTypes: readonly AppNotificationType[] = ['ORGANIZATION_INVITE'];

export function filterNotifications(notifications: AppNotification[], filter: NotificationFilter) {
  if (filter === 'all') return notifications;
  const wantsCondo = filter === 'condo';
  return notifications.filter((notification) => condoTypes.includes(notification.type) === wantsCondo);
}

export type NotificationSection = { key: 'today' | 'week' | 'older'; title: string; items: AppNotification[] };

const DAY = 24 * 60 * 60_000;

function startOfDay(time: number) {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function groupNotifications(notifications: AppNotification[], now: number): NotificationSection[] {
  const today = startOfDay(now);
  const weekStart = today - 6 * DAY;
  const sections: NotificationSection[] = [
    { key: 'today', title: 'Hoje', items: [] },
    { key: 'week', title: 'Esta semana', items: [] },
    { key: 'older', title: 'Anteriores', items: [] },
  ];

  for (const notification of notifications) {
    const time = Date.parse(notification.createdAt);
    const index = time >= today ? 0 : time >= weekStart ? 1 : 2;
    sections[index].items.push(notification);
  }

  return sections.filter((section) => section.items.length > 0);
}

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

export function formatNotificationTime(iso: string, now: number) {
  const time = Date.parse(iso);
  return time >= startOfDay(now) ? timeFormatter.format(time) : dateFormatter.format(time);
}
