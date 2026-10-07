import type { ChargePointType, ChargingSession } from '@/features/charging/api/charging-api';

const TIME_ZONE = 'America/Sao_Paulo';

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const monthLabelFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' });

export type MonthOption = { value: string; label: string };

export type HistorySummary = {
  energyKwh: number;
  energyCents: number;
  idleCents: number;
  totalCents: number;
};

export type WeekBucket = { label: string; energyKwh: number };

function dateParts(time: number) {
  const [year, month, day] = dateKeyFormatter.format(time).split('-').map(Number);
  return { year, month, day };
}

function toMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return capitalize(monthLabelFormatter.format(Date.UTC(year, month - 1, 15)));
}

export function getRecentMonths(now: number, count = 3): MonthOption[] {
  const { year, month } = dateParts(now);
  return Array.from({ length: count }, (_, offset) => {
    const index = year * 12 + (month - 1) - offset;
    const value = toMonthKey(Math.floor(index / 12), (index % 12) + 1);
    return { value, label: formatMonthLabel(value) };
  });
}

export function summarizeSessions(sessions: ChargingSession[]): HistorySummary {
  return sessions.reduce<HistorySummary>(
    (summary, session) => ({
      energyKwh: summary.energyKwh + session.energyKwh,
      energyCents: summary.energyCents + session.energyCostCents,
      idleCents: summary.idleCents + session.idleFeeCents,
      totalCents: summary.totalCents + session.totalCents,
    }),
    { energyKwh: 0, energyCents: 0, idleCents: 0, totalCents: 0 },
  );
}

function daysInMonth(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getWeeklyConsumption(sessions: ChargingSession[], monthKey: string): WeekBucket[] {
  const weeks = Math.ceil(daysInMonth(monthKey) / 7);
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, index) => ({ label: `S${index + 1}`, energyKwh: 0 }));

  for (const session of sessions) {
    const { year, month, day } = dateParts(Date.parse(session.startedAt));
    if (toMonthKey(year, month) !== monthKey) continue;
    buckets[Math.floor((day - 1) / 7)].energyKwh += session.energyKwh;
  }

  return buckets;
}

export function getRegimes(sessions: ChargingSession[]): ChargePointType[] {
  const regimes = new Set(sessions.map((session) => session.regime));
  return (['PRIVATE', 'COMMERCIAL'] as const).filter((regime) => regimes.has(regime));
}
