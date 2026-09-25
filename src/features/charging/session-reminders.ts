import type { ChargingSession } from '@/features/charging/api/charging-api';
import { formatCents } from '@/features/charging/charging-format';
import { isSessionOpen } from '@/features/charging/session-timing';
import type { Reminder } from '@/lib/scheduled-reminders';

export const SESSION_REMINDER_PREFIX = 'session-reminder:';
export const SESSION_REMINDER_TYPE = 'SESSION_REMINDER';

const GRACE_REMINDER_LEAD_MS = 2 * 60_000;

function graceReminderLead(session: ChargingSession, graceEndsAtMs: number) {
  if (!session.chargingEndedAt) return GRACE_REMINDER_LEAD_MS;
  const graceMs = graceEndsAtMs - Date.parse(session.chargingEndedAt);
  return Math.min(GRACE_REMINDER_LEAD_MS, Math.max(0, graceMs / 2));
}

export function planSessionReminders(session: ChargingSession | null | undefined): Reminder[] {
  if (!session || !isSessionOpen(session.status) || !session.graceEndsAt) return [];

  const graceEndsAtMs = Date.parse(session.graceEndsAt);
  const data = { type: SESSION_REMINDER_TYPE, sessionId: session.id };
  const name = session.chargePoint.name;
  const reminders: Reminder[] = [
    {
      identifier: `${SESSION_REMINDER_PREFIX}${session.id}:grace`,
      title: 'Tolerância acabando',
      body: `Libere a vaga ${name} para evitar a taxa de ocupação.`,
      fireAt: new Date(graceEndsAtMs - graceReminderLead(session, graceEndsAtMs)).toISOString(),
      data,
    },
  ];

  if (session.idleFeeCentsPerMinute > 0) {
    reminders.push({
      identifier: `${SESSION_REMINDER_PREFIX}${session.id}:idle`,
      title: 'Taxa de ocupação iniciada',
      body: `A vaga ${name} segue ocupada: ${formatCents(session.idleFeeCentsPerMinute)} por minuto até liberar.`,
      fireAt: new Date(session.idleStartsAt ?? session.graceEndsAt).toISOString(),
      data,
    });
  }

  return reminders;
}

export function getRemindersSignature(reminders: Reminder[]) {
  return reminders.map((reminder) => `${reminder.identifier}@${reminder.fireAt}`).join('|');
}
