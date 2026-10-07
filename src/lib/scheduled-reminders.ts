import * as Notifications from 'expo-notifications';

import { DEFAULT_CHANNEL_ID, ensureAndroidChannel, isPushSupported } from '@/lib/push-notifications';

export type Reminder = {
  identifier: string;
  title: string;
  body: string;
  fireAt: string;
  data?: Record<string, unknown>;
};

export const RESCHEDULE_TOLERANCE_MS = 30_000;

function readFireAt(request: Notifications.NotificationRequest) {
  const fireAt = request.content.data?.fireAt;
  return typeof fireAt === 'string' ? Date.parse(fireAt) : Number.NaN;
}

function isStillOnTime(request: Notifications.NotificationRequest, reminder: Reminder) {
  return Math.abs(readFireAt(request) - Date.parse(reminder.fireAt)) <= RESCHEDULE_TOLERANCE_MS;
}

export async function syncScheduledReminders(prefix: string, reminders: Reminder[], now = Date.now()) {
  if (!isPushSupported()) return;

  const upcoming = reminders.filter((reminder) => new Date(reminder.fireAt).getTime() > now);
  const wanted = new Map(upcoming.map((reminder) => [reminder.identifier, reminder]));
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const kept = new Set<string>();

  for (const request of scheduled) {
    if (!request.identifier.startsWith(prefix)) continue;
    const reminder = wanted.get(request.identifier);
    if (reminder && isStillOnTime(request, reminder)) {
      kept.add(request.identifier);
      continue;
    }
    await Notifications.cancelScheduledNotificationAsync(request.identifier);
  }

  const pending = upcoming.filter((reminder) => !kept.has(reminder.identifier));
  if (pending.length === 0) return;

  await ensureAndroidChannel().catch(() => undefined);
  for (const reminder of pending) {
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.identifier,
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: 'default',
        data: { ...reminder.data, fireAt: reminder.fireAt },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(reminder.fireAt),
        channelId: DEFAULT_CHANNEL_ID,
      },
    });
  }
}

export async function cancelAllScheduledReminders() {
  if (!isPushSupported()) return;
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
}
