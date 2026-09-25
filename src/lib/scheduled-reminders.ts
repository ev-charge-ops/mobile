import * as Notifications from 'expo-notifications';

import { isPushSupported } from '@/lib/push-notifications';

export type Reminder = {
  identifier: string;
  title: string;
  body: string;
  fireAt: string;
  data?: Record<string, unknown>;
};

function readFireAt(request: Notifications.NotificationRequest) {
  const fireAt = request.content.data?.fireAt;
  return typeof fireAt === 'string' ? fireAt : null;
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
    if (reminder && readFireAt(request) === reminder.fireAt) {
      kept.add(request.identifier);
      continue;
    }
    await Notifications.cancelScheduledNotificationAsync(request.identifier);
  }

  for (const reminder of upcoming) {
    if (kept.has(reminder.identifier)) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.identifier,
      content: {
        title: reminder.title,
        body: reminder.body,
        data: { ...reminder.data, fireAt: reminder.fireAt },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(reminder.fireAt) },
    });
  }
}

export async function cancelAllScheduledReminders() {
  if (!isPushSupported()) return;
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
}
