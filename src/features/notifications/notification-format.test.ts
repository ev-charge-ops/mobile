import { formatRelativeTime } from '@/features/notifications/notification-format';

function at(year: number, month: number, day: number, hour: number, minute = 0) {
  return new Date(year, month - 1, day, hour, minute);
}

describe('formatRelativeTime', () => {
  const now = at(2026, 10, 7, 22, 30).getTime();

  it('shows recent notices relative to now', () => {
    expect(formatRelativeTime(at(2026, 10, 7, 22, 29).toISOString(), now + 30_000)).toBe('há 1 min');
    expect(formatRelativeTime(new Date(now - 20_000).toISOString(), now)).toBe('agora');
    expect(formatRelativeTime(at(2026, 10, 7, 22, 5).toISOString(), now)).toBe('há 25 min');
    expect(formatRelativeTime(at(2026, 10, 7, 19, 0).toISOString(), now)).toBe('há 3 h');
  });

  it('shows the time for older notices of today, yesterday and the date before that', () => {
    expect(formatRelativeTime(at(2026, 10, 7, 8, 15).toISOString(), now)).toBe('08:15');
    expect(formatRelativeTime(at(2026, 10, 6, 9, 0).toISOString(), now)).toBe('ontem');
    expect(formatRelativeTime(at(2026, 8, 21, 9, 0).toISOString(), now)).toBe('21/08');
  });
});
