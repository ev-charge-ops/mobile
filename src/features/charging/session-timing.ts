import type { ChargingSession, ChargingSessionStatus } from '@/features/charging/api/charging-api';

const openStatuses: readonly ChargingSessionStatus[] = ['PENDING', 'ACTIVE', 'GRACE', 'IDLE'];

export function isSessionOpen(status: ChargingSessionStatus) {
  return openStatuses.includes(status);
}

function simulatedSeconds(fromIso: string, toMs: number, speed: number) {
  return Math.max(0, ((toMs - Date.parse(fromIso)) / 1000) * speed);
}

function endOf(iso: string | null, now: number) {
  return iso ? Math.min(Date.parse(iso), now) : now;
}

export function getChargingSeconds(session: ChargingSession, now: number) {
  const end = endOf(session.chargingEndedAt ?? session.endedAt, now);
  return simulatedSeconds(session.startedAt, end, session.simulationSpeed);
}

export function getGraceRemainingSeconds(session: ChargingSession, now: number) {
  if (!session.graceEndsAt) return 0;
  return Math.max(0, ((Date.parse(session.graceEndsAt) - now) / 1000) * session.simulationSpeed);
}

export function getIdleSeconds(session: ChargingSession, now: number) {
  if (!session.graceEndsAt) return 0;
  return simulatedSeconds(session.graceEndsAt, endOf(session.endedAt, now), session.simulationSpeed);
}

export function estimateIdleFeeCents(session: ChargingSession, now: number) {
  if (session.status !== 'IDLE') return session.idleFeeCents;
  const minutes = Math.ceil(getIdleSeconds(session, now) / 60);
  const estimate = Math.min(session.idleFeeCapCents, minutes * session.idleFeeCentsPerMinute);
  return Math.max(session.idleFeeCents, estimate);
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatClock(totalSeconds: number) {
  const seconds = Math.floor(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${pad(minutes)}:${pad(rest)}`;
}

export function formatDuration(totalSeconds: number) {
  const seconds = Math.floor(totalSeconds);
  if (seconds < 60) return `${seconds} s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${pad(minutes)} min`;
}
