import type { ChargingSession } from '@/features/charging/api/charging-api';
import { formatCents } from '@/features/charging/charging-format';
import { formatDuration, isSessionOpen } from '@/features/charging/session-timing';
import type { Reminder } from '@/lib/scheduled-reminders';

export const SESSION_REMINDER_PREFIX = 'session-reminder:';
export const SESSION_REMINDER_TYPE = 'SESSION_REMINDER';

export type SessionReminderKind = 'complete' | 'grace' | 'idle';

const GRACE_REMINDER_LEAD_MS = 2 * 60_000;

type SessionTimeline = {
  chargingEndsAt: number | null;
  graceEndsAt: number | null;
  idleStartsAt: number | null;
};

function parseTime(iso: string | null | undefined) {
  if (!iso) return null;
  const time = Date.parse(iso);
  return Number.isNaN(time) ? null : time;
}

export function getSessionTimeline(session: ChargingSession): SessionTimeline {
  const graceEndsAt = parseTime(session.graceEndsAt ?? session.projectedGraceEndsAt);
  return {
    chargingEndsAt: parseTime(session.chargingEndedAt ?? session.projectedChargingEndsAt),
    graceEndsAt,
    idleStartsAt: parseTime(session.idleStartsAt ?? session.projectedIdleStartsAt) ?? graceEndsAt,
  };
}

function graceReminderLead(chargingEndsAt: number | null, graceEndsAt: number) {
  if (chargingEndsAt === null) return GRACE_REMINDER_LEAD_MS;
  return Math.min(GRACE_REMINDER_LEAD_MS, Math.max(0, (graceEndsAt - chargingEndsAt) / 2));
}

export function getSessionReminderPrefix(sessionId: string) {
  return `${SESSION_REMINDER_PREFIX}${sessionId}:`;
}

export function planSessionReminders(session: ChargingSession | null | undefined): Reminder[] {
  if (!session || !isSessionOpen(session.status)) return [];

  const { chargingEndsAt, graceEndsAt, idleStartsAt } = getSessionTimeline(session);
  const name = session.chargePoint.name;
  const reminder = (kind: SessionReminderKind, fireAt: number, title: string, body: string): Reminder => ({
    identifier: `${getSessionReminderPrefix(session.id)}${kind}`,
    title,
    body,
    fireAt: new Date(fireAt).toISOString(),
    data: { type: SESSION_REMINDER_TYPE, sessionId: session.id, reminder: kind },
  });
  const reminders: Reminder[] = [];

  if (chargingEndsAt !== null) {
    const tolerance = formatDuration(session.gracePeriodMinutes * 60);
    reminders.push(
      reminder(
        'complete',
        chargingEndsAt,
        'Recarga concluída',
        `Seu veículo na vaga ${name} terminou de carregar. Você tem ${tolerance} de tolerância para liberar a vaga.`,
      ),
    );
  }

  if (graceEndsAt !== null) {
    reminders.push(
      reminder(
        'grace',
        graceEndsAt - graceReminderLead(chargingEndsAt, graceEndsAt),
        'Tolerância acabando',
        `Libere a vaga ${name} para evitar a taxa de ocupação.`,
      ),
    );
  }

  if (idleStartsAt !== null && session.idleFeeCentsPerMinute > 0) {
    reminders.push(
      reminder(
        'idle',
        idleStartsAt,
        'Taxa de ocupação iniciada',
        `A vaga ${name} segue ocupada: ${formatCents(session.idleFeeCentsPerMinute)} por minuto até liberar.`,
      ),
    );
  }

  return reminders;
}

export function getRemindersSignature(reminders: Reminder[]) {
  return reminders.map((reminder) => `${reminder.identifier}@${reminder.fireAt}`).join('|');
}
