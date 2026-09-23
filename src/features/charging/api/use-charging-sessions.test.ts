import { hasOpenSession } from '@/features/charging/api/use-charging-sessions';
import { buildClosedSession, buildSession } from '@/features/charging/testing/session-fixtures';

describe('hasOpenSession', () => {
  it.each(['AWAITING_PAYMENT', 'PENDING', 'ACTIVE', 'GRACE', 'IDLE'] as const)('is true for %s', (status) => {
    expect(hasOpenSession(buildSession({ status }))).toBe(true);
  });

  it('is false for ended sessions or no session', () => {
    expect(hasOpenSession(buildClosedSession())).toBe(false);
    expect(hasOpenSession(buildSession({ status: 'INTERRUPTED' }))).toBe(false);
    expect(hasOpenSession(null)).toBe(false);
    expect(hasOpenSession(undefined)).toBe(false);
  });
});
