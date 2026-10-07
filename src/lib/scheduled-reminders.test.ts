import * as Notifications from 'expo-notifications';

import { syncScheduledReminders, type Reminder } from '@/lib/scheduled-reminders';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

const notifications = jest.mocked(Notifications);
const NOW = Date.parse('2026-10-07T20:00:00.000Z');

function reminder(identifier: string, fireAt: string): Reminder {
  return { identifier, title: 'Título', body: 'Corpo', fireAt, data: { sessionId: 's1' } };
}

function scheduled(identifier: string, fireAt: string) {
  return { identifier, content: { data: { fireAt } }, trigger: null } as unknown as Notifications.NotificationRequest;
}

beforeEach(() => {
  jest.clearAllMocks();
  notifications.getAllScheduledNotificationsAsync.mockResolvedValue([]);
});

describe('syncScheduledReminders', () => {
  it('schedules the upcoming reminders with a date trigger and skips past ones', async () => {
    await syncScheduledReminders(
      'r:',
      [reminder('r:a', '2026-10-07T20:05:00.000Z'), reminder('r:b', '2026-10-07T19:59:00.000Z')],
      NOW,
    );

    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      identifier: 'r:a',
      content: { title: 'Título', body: 'Corpo', data: { sessionId: 's1', fireAt: '2026-10-07T20:05:00.000Z' } },
      trigger: { type: 'date', date: new Date('2026-10-07T20:05:00.000Z') },
    });
  });

  it('is idempotent and only replaces reminders whose time changed', async () => {
    notifications.getAllScheduledNotificationsAsync.mockResolvedValue([
      scheduled('r:a', '2026-10-07T20:05:00.000Z'),
      scheduled('r:b', '2026-10-07T20:06:00.000Z'),
      scheduled('r:stale', '2026-10-07T20:07:00.000Z'),
      scheduled('other', '2026-10-07T20:07:00.000Z'),
    ]);

    await syncScheduledReminders(
      'r:',
      [reminder('r:a', '2026-10-07T20:05:00.000Z'), reminder('r:b', '2026-10-07T20:10:00.000Z')],
      NOW,
    );

    expect(notifications.cancelScheduledNotificationAsync.mock.calls).toEqual([['r:b'], ['r:stale']]);
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'r:b' }));
  });

  it('cancels every reminder of the prefix when nothing is planned', async () => {
    notifications.getAllScheduledNotificationsAsync.mockResolvedValue([scheduled('r:a', '2026-10-07T20:05:00.000Z')]);

    await syncScheduledReminders('r:', [], NOW);

    expect(notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('r:a');
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
