import {
  formatClosingDate,
  formatCompactDuration,
  formatMonthLabel,
  formatShortMonthLabel,
  getCurrentMonth,
  getDailyBars,
  getMonthDistance,
  getSessionDayTile,
  getSessionDuration,
  shiftMonth,
} from '@/features/charging/history-month';
import { buildClosedSession } from '@/features/charging/testing/session-fixtures';

describe('months', () => {
  it('reads the current month in São Paulo time', () => {
    expect(getCurrentMonth(Date.parse('2026-10-07T15:00:00.000Z'))).toBe('2026-10');
    expect(getCurrentMonth(Date.parse('2026-02-01T02:00:00.000Z'))).toBe('2026-01');
  });

  it('steps across years', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2025-12', 1)).toBe('2026-01');
    expect(getMonthDistance('2025-11', '2026-02')).toBe(3);
  });

  it('formats long and short labels', () => {
    expect(formatMonthLabel('2026-03')).toBe('Março');
    expect(formatShortMonthLabel('2026-09')).toBe('Set 2026');
  });
});

describe('getDailyBars', () => {
  it('fills every day of the month relative to the busiest one', () => {
    const bars = getDailyBars(
      [
        { date: '2026-09-03', energyKwh: 10 },
        { date: '2026-09-07', energyKwh: 20 },
        { date: '2026-09-07', energyKwh: 5 },
        { date: '2026-08-31', energyKwh: 99 },
      ],
      '2026-09',
    );

    expect(bars).toHaveLength(30);
    expect(bars[2]).toEqual({ day: 3, energyKwh: 10, ratio: 0.4 });
    expect(bars[6]).toEqual({ day: 7, energyKwh: 25, ratio: 1 });
    expect(bars[0].ratio).toBe(0);
  });

  it('stays flat without energy', () => {
    expect(getDailyBars([], '2026-02').every((bar) => bar.ratio === 0)).toBe(true);
    expect(getDailyBars([], '2028-02')).toHaveLength(29);
  });
});

describe('session rows', () => {
  it('formats the closing date in local time', () => {
    expect(formatClosingDate('2026-10-01T02:59:59.999Z')).toBe('30/09');
  });

  it('builds the date tile', () => {
    expect(getSessionDayTile('2026-09-27T12:00:00.000Z')).toEqual({ day: '27', month: 'SET' });
  });

  it('formats compact durations', () => {
    expect(formatCompactDuration(45 * 60)).toBe('45min');
    expect(formatCompactDuration(161 * 60)).toBe('2h 41min');
  });

  it('uses the simulated charging time of the session', () => {
    expect(getSessionDuration(buildClosedSession(), Date.parse('2026-10-07T15:00:00.000Z'))).toBe('19min');
  });
});
