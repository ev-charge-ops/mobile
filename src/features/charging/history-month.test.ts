import {
  formatMonthLabel,
  getRecentMonths,
  getRegimes,
  getWeeklyConsumption,
  summarizeSessions,
} from '@/features/charging/history-month';
import { buildClosedSession } from '@/features/charging/testing/session-fixtures';

describe('getRecentMonths', () => {
  it('lists the current month and the two before it in São Paulo time', () => {
    expect(getRecentMonths(Date.parse('2026-10-07T15:00:00.000Z'))).toEqual([
      { value: '2026-10', label: 'Outubro' },
      { value: '2026-09', label: 'Setembro' },
      { value: '2026-08', label: 'Agosto' },
    ]);
  });

  it('crosses the year and uses the local month near midnight', () => {
    expect(getRecentMonths(Date.parse('2026-02-01T02:00:00.000Z')).map((month) => month.value)).toEqual([
      '2026-01',
      '2025-12',
      '2025-11',
    ]);
  });

  it('formats a month label', () => {
    expect(formatMonthLabel('2026-03')).toBe('Março');
  });
});

describe('summarizeSessions', () => {
  it('adds energy, costs, idle fees and totals', () => {
    const summary = summarizeSessions([
      buildClosedSession({ energyKwh: 2, energyCostCents: 178, idleFeeCents: 1100, totalCents: 1278 }),
      buildClosedSession({ energyKwh: 16.4, energyCostCents: 1460, idleFeeCents: 0, totalCents: 1460 }),
    ]);

    expect(summary.energyKwh).toBeCloseTo(18.4);
    expect(summary).toMatchObject({ energyCents: 1638, idleCents: 1100, totalCents: 2738 });
  });
});

describe('getWeeklyConsumption', () => {
  it('buckets the energy by week of the month in São Paulo time', () => {
    const weeks = getWeeklyConsumption(
      [
        buildClosedSession({ startedAt: '2026-08-01T12:00:00.000Z', energyKwh: 5 }),
        buildClosedSession({ startedAt: '2026-08-07T20:00:00.000Z', energyKwh: 3 }),
        buildClosedSession({ startedAt: '2026-08-15T02:00:00.000Z', energyKwh: 4 }),
        buildClosedSession({ startedAt: '2026-08-31T22:00:00.000Z', energyKwh: 7 }),
        buildClosedSession({ startedAt: '2026-09-01T02:00:00.000Z', energyKwh: 9 }),
      ],
      '2026-08',
    );

    expect(weeks).toEqual([
      { label: 'S1', energyKwh: 8 },
      { label: 'S2', energyKwh: 4 },
      { label: 'S3', energyKwh: 0 },
      { label: 'S4', energyKwh: 0 },
      { label: 'S5', energyKwh: 16 },
    ]);
  });

  it('uses four weeks for a 28 day February', () => {
    expect(getWeeklyConsumption([], '2026-02')).toHaveLength(4);
  });
});

describe('getRegimes', () => {
  it('lists the regimes present in the month', () => {
    expect(getRegimes([])).toEqual([]);
    expect(getRegimes([buildClosedSession({ regime: 'COMMERCIAL' }), buildClosedSession()])).toEqual([
      'PRIVATE',
      'COMMERCIAL',
    ]);
  });
});
