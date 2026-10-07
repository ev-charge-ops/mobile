import { useEffect } from 'react';

import type { ChargingSession } from '@/features/charging/api/charging-api';
import { useActiveSession } from '@/features/charging/api/use-charging-sessions';
import {
  getRemindersSignature,
  planSessionReminders,
  SESSION_REMINDER_PREFIX,
} from '@/features/charging/session-reminders';
import { syncScheduledReminders } from '@/lib/scheduled-reminders';

let queue: Promise<void> = Promise.resolve();
let lastSignature: string | null = null;

function enqueue(task: () => Promise<void>) {
  queue = queue.then(task).catch(() => undefined);
  return queue;
}

export function syncSessionReminders(session: ChargingSession | null | undefined) {
  const reminders = planSessionReminders(session);
  const signature = getRemindersSignature(reminders);
  if (signature === lastSignature) return queue;
  lastSignature = signature;
  return enqueue(() =>
    syncScheduledReminders(SESSION_REMINDER_PREFIX, reminders).catch(() => {
      if (lastSignature === signature) lastSignature = null;
    }),
  );
}

export function resetSessionRemindersCache() {
  lastSignature = null;
}

export function useSessionReminders() {
  const { data: session, isSuccess } = useActiveSession();

  useEffect(() => {
    if (isSuccess) void syncSessionReminders(session);
  }, [isSuccess, session]);

  useEffect(() => resetSessionRemindersCache, []);
}
