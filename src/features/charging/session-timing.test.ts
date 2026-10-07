import {
  estimateIdleFeeCents,
  formatClock,
  formatDuration,
  getChargingSeconds,
  getGraceRemainingSeconds,
  getIdleSeconds,
  isSessionOpen,
} from '@/features/charging/session-timing';
import { buildSession } from '@/features/charging/testing/session-fixtures';

const at = (iso: string) => Date.parse(iso);

describe('session timing', () => {
  it('knows which statuses are open', () => {
    expect(isSessionOpen('ACTIVE')).toBe(true);
    expect(isSessionOpen('GRACE')).toBe(true);
    expect(isSessionOpen('IDLE')).toBe(true);
    expect(isSessionOpen('CLOSED')).toBe(false);
    expect(isSessionOpen('INTERRUPTED')).toBe(false);
  });

  it('scales the charging time by the simulation speed', () => {
    const session = buildSession({ startedAt: '2026-10-07T13:55:00.000Z', simulationSpeed: 60 });

    expect(getChargingSeconds(session, at('2026-10-07T13:55:10.000Z'))).toBe(600);
  });

  it('stops counting the charging time when charging ends', () => {
    const session = buildSession({
      status: 'GRACE',
      startedAt: '2026-10-07T13:55:00.000Z',
      chargingEndedAt: '2026-10-07T13:55:20.000Z',
    });

    expect(getChargingSeconds(session, at('2026-10-07T13:56:00.000Z'))).toBe(1200);
  });

  it('counts the grace period down in simulated time', () => {
    const session = buildSession({ status: 'GRACE', graceEndsAt: '2026-10-07T13:55:30.000Z' });

    expect(getGraceRemainingSeconds(session, at('2026-10-07T13:55:25.000Z'))).toBe(300);
    expect(getGraceRemainingSeconds(session, at('2026-10-07T13:55:40.000Z'))).toBe(0);
  });

  it('estimates the idle fee between polls without passing the cap', () => {
    const session = buildSession({
      status: 'IDLE',
      graceEndsAt: '2026-10-07T13:55:30.000Z',
      idleFeeCents: 100,
      idleFeeCentsPerMinute: 25,
      idleFeeCapCents: 3000,
    });

    expect(getIdleSeconds(session, at('2026-10-07T13:55:40.000Z'))).toBe(600);
    expect(estimateIdleFeeCents(session, at('2026-10-07T13:55:40.000Z'))).toBe(250);
    expect(estimateIdleFeeCents(session, at('2026-10-07T14:30:00.000Z'))).toBe(3000);
  });

  it('keeps the server idle fee once the session is not idle', () => {
    const session = buildSession({ status: 'CLOSED', idleFeeCents: 1100, graceEndsAt: '2026-10-07T13:55:30.000Z' });

    expect(estimateIdleFeeCents(session, at('2026-10-07T14:30:00.000Z'))).toBe(1100);
  });

  it('formats clocks and durations', () => {
    expect(formatClock(305)).toBe('05:05');
    expect(formatClock(3725)).toBe('1:02:05');
    expect(formatDuration(42)).toBe('42 s');
    expect(formatDuration(1020)).toBe('17 min');
    expect(formatDuration(3900)).toBe('1 h 05 min');
  });
});
