import { getReceiptTiming, toSimulatedTime } from '@/features/charging/components/session-receipt';
import { buildClosedSession } from '@/features/charging/testing/session-fixtures';

describe('receipt timing', () => {
  const session = buildClosedSession({
    startedAt: '2026-10-08T17:33:00.000Z',
    chargingEndedAt: '2026-10-08T17:33:12.000Z',
    endedAt: '2026-10-08T17:33:12.000Z',
    simulationSpeed: 60,
    energyKwh: 1.4,
  });

  it('reports the simulated duration and end of an accelerated session', () => {
    const { endedAt, totalSeconds, averageKw } = getReceiptTiming(session);

    expect(totalSeconds).toBe(720);
    expect(endedAt).toBe('2026-10-08T17:45:00.000Z');
    expect(averageKw).toBeCloseTo(7);
  });

  it('maps a real reading time to the simulated clock', () => {
    expect(toSimulatedTime(session, '2026-10-08T17:33:06.000Z')).toBe('2026-10-08T17:39:00.000Z');
  });
});
