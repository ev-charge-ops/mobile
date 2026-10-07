import {
  Ban,
  Building2,
  CircleCheck,
  CreditCard,
  Hourglass,
  Receipt,
  TriangleAlert,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { colors } from '@/constants/theme';
import type { AppNotificationType } from '@/features/notifications/api/notifications-api';

export type NotificationTone = { icon: LucideIcon; color: string; backgroundColor: string };

const charging = { color: colors.statusCharging, backgroundColor: colors.statusChargingBg };
const idle = { color: colors.statusIdle, backgroundColor: colors.statusIdleBg };
const fault = { color: colors.statusFault, backgroundColor: colors.statusFaultBg };
const info = { color: colors.statusInfo, backgroundColor: colors.statusInfoBg };

export const notificationTones: Record<AppNotificationType, NotificationTone> = {
  SESSION_ACTIVE: { icon: Zap, ...charging },
  CHARGING_COMPLETE: { icon: CircleCheck, ...charging },
  IDLE_FEE_STARTED: { icon: TriangleAlert, ...fault },
  PAYMENT_CAPTURED: { icon: Receipt, ...info },
  PAYMENT_FAILED: { icon: CreditCard, ...fault },
  SESSION_INTERRUPTED: { icon: Ban, ...fault },
  ORGANIZATION_INVITE: { icon: Building2, ...info },
  QUEUE_TURN: { icon: Hourglass, ...idle },
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

function dayKey(time: number) {
  return new Date(time).toDateString();
}

export function formatRelativeTime(iso: string, now: number) {
  const time = Date.parse(iso);
  const elapsed = now - time;

  if (elapsed < MINUTE) return 'agora';
  if (elapsed < HOUR) return `há ${Math.floor(elapsed / MINUTE)} min`;
  if (elapsed < 6 * HOUR) return `há ${Math.floor(elapsed / HOUR)} h`;

  const day = dayKey(time);
  if (day === dayKey(now)) return timeFormatter.format(time);
  if (day === dayKey(now - 24 * HOUR)) return 'ontem';
  return dateFormatter.format(time);
}
