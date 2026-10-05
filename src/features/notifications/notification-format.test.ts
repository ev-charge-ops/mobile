import {
  filterNotifications,
  formatNotificationTime,
  groupNotifications,
} from '@/features/notifications/notification-format';
import { buildNotification } from '@/features/notifications/testing/notification-fixtures';

function at(year: number, month: number, day: number, hour: number, minute = 0) {
  return new Date(year, month - 1, day, hour, minute);
}

const now = at(2026, 10, 7, 22, 30).getTime();

describe('formatNotificationTime', () => {
  it('shows the clock for today and the date before that', () => {
    expect(formatNotificationTime(at(2026, 10, 7, 21, 17).toISOString(), now)).toBe('21:17');
    expect(formatNotificationTime(at(2026, 10, 7, 0, 5).toISOString(), now)).toBe('00:05');
    expect(formatNotificationTime(at(2026, 9, 27, 9, 0).toISOString(), now)).toBe('27/09');
  });
});

describe('groupNotifications', () => {
  it('splits today, this week and older notices and skips empty groups', () => {
    const today = buildNotification({ id: 'today', createdAt: at(2026, 10, 7, 8, 0).toISOString() });
    const week = buildNotification({ id: 'week', createdAt: at(2026, 10, 1, 23, 0).toISOString() });
    const older = buildNotification({ id: 'older', createdAt: at(2026, 9, 30, 23, 0).toISOString() });

    expect(
      groupNotifications([today, week, older], now).map((section) => [section.title, section.items.map((n) => n.id)]),
    ).toEqual([
      ['Hoje', ['today']],
      ['Esta semana', ['week']],
      ['Anteriores', ['older']],
    ]);
    expect(groupNotifications([older], now).map((section) => section.key)).toEqual(['older']);
    expect(groupNotifications([], now)).toEqual([]);
  });
});

describe('filterNotifications', () => {
  const charging = buildNotification({ id: 'charging', type: 'SESSION_ACTIVE' });
  const invite = buildNotification({ id: 'invite', type: 'ORGANIZATION_INVITE' });

  it('separates charging and condo notices', () => {
    expect(filterNotifications([charging, invite], 'all')).toHaveLength(2);
    expect(filterNotifications([charging, invite], 'charging').map((n) => n.id)).toEqual(['charging']);
    expect(filterNotifications([charging, invite], 'condo').map((n) => n.id)).toEqual(['invite']);
  });
});
