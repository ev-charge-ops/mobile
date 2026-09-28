import { useEffect } from 'react';

import type { ChargingSession } from '@/features/charging/api/charging-api';
import { useActiveSession } from '@/features/charging/api/use-charging-sessions';
import { resetSessionRemindersCache, syncSessionReminders } from '@/features/charging/session-reminder-sync';

export function useSessionReminderSync(session: ChargingSession | null | undefined) {
  useEffect(() => {
    if (session) void syncSessionReminders(session);
  }, [session]);
}

export function useSessionReminders() {
  const { data: session, isSuccess } = useActiveSession();

  useEffect(() => {
    if (isSuccess) void syncSessionReminders(session);
  }, [isSuccess, session]);

  useEffect(() => resetSessionRemindersCache, []);
}
