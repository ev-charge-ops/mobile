import type { ChargingSession } from '@/features/charging/api/charging-api';
import { getChargingSeconds } from '@/features/charging/session-timing';

const TIME_ZONE = 'America/Sao_Paulo';

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const monthLabelFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' });

const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const HISTORY_MONTHS_BACK = 12;

export type DailyBar = { day: number; energyKwh: number; ratio: number };

function dateParts(time: number) {
  const [year, month, day] = dateKeyFormatter.format(time).split('-').map(Number);
  return { year, month, day };
}

function parseMonth(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return { year, month };
}

function toMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getCurrentMonth(now: number) {
  const { year, month } = dateParts(now);
  return toMonthKey(year, month);
}

export function shiftMonth(monthKey: string, offset: number) {
  const { year, month } = parseMonth(monthKey);
  const index = year * 12 + (month - 1) + offset;
  return toMonthKey(Math.floor(index / 12), (index % 12) + 1);
}

export function getMonthDistance(from: string, to: string) {
  const a = parseMonth(from);
  const b = parseMonth(to);
  return (b.year - a.year) * 12 + (b.month - a.month);
}

export function formatMonthLabel(monthKey: string) {
  const { year, month } = parseMonth(monthKey);
  return capitalize(monthLabelFormatter.format(Date.UTC(year, month - 1, 15)));
}

export function formatShortMonthLabel(monthKey: string) {
  const { year, month } = parseMonth(monthKey);
  return `${shortMonths[month - 1]} ${year}`;
}

export function getDaysInMonth(monthKey: string) {
  const { year, month } = parseMonth(monthKey);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getDailyBars(dailyEnergy: { date: string; energyKwh: number }[], monthKey: string): DailyBar[] {
  const energyByDay = new Map<number, number>();
  for (const entry of dailyEnergy) {
    if (!entry.date.startsWith(`${monthKey}-`)) continue;
    const day = Number(entry.date.slice(8, 10));
    energyByDay.set(day, (energyByDay.get(day) ?? 0) + entry.energyKwh);
  }
  const max = Math.max(0, ...energyByDay.values());

  return Array.from({ length: getDaysInMonth(monthKey) }, (_, index) => {
    const energyKwh = energyByDay.get(index + 1) ?? 0;
    return { day: index + 1, energyKwh, ratio: max > 0 ? energyKwh / max : 0 };
  });
}

export function formatClosingDate(iso: string) {
  const { month, day } = dateParts(Date.parse(iso));
  return `${pad(day)}/${pad(month)}`;
}

export function getSessionDayTile(iso: string) {
  const { month, day } = dateParts(Date.parse(iso));
  return { day: String(day), month: shortMonths[month - 1].toUpperCase() };
}

export function formatCompactDuration(totalSeconds: number) {
  const minutes = Math.max(0, Math.round(totalSeconds / 60));
  if (minutes < 60) return `${minutes}min`;
  return `${Math.floor(minutes / 60)}h ${pad(minutes % 60)}min`;
}

export function getSessionDuration(session: ChargingSession, now: number) {
  return formatCompactDuration(getChargingSeconds(session, now));
}
