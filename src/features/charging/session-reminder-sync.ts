import type { ChargingSession } from '@/features/charging/api/charging-api';
import {
  getRemindersSignature,
  getSessionReminderPrefix,
  planSessionReminders,
  SESSION_REMINDER_PREFIX,
} from '@/features/charging/session-reminders';
import { isSessionOpen } from '@/features/charging/session-timing';
import { syncScheduledReminders } from '@/lib/scheduled-reminders';

let queue: Promise<void> = Promise.resolve();
let lastSignature: string | null = null;

function enqueue(task: () => Promise<void>) {
  queue = queue.then(task).catch(() => undefined);
  return queue;
}

function reminderPrefixFor(session: ChargingSession | null | undefined) {
  return session && !isSessionOpen(session.status) ? getSessionReminderPrefix(session.id) : SESSION_REMINDER_PREFIX;
}

export function syncSessionReminders(session: ChargingSession | null | undefined) {
  const prefix = reminderPrefixFor(session);
  const reminders = planSessionReminders(session);
  const signature = `${prefix}#${getRemindersSignature(reminders)}`;
  if (signature === lastSignature) return queue;
  lastSignature = signature;
  return enqueue(() =>
    syncScheduledReminders(prefix, reminders).catch(() => {
      if (lastSignature === signature) lastSignature = null;
    }),
  );
}

export function resetSessionRemindersCache() {
  lastSignature = null;
}
