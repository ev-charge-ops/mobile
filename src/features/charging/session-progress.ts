import type {
  ChargingSession,
  ChargingSessionDetail,
  ChargingSessionStatus,
} from '@/features/charging/api/charging-api';
import { getGraceRemainingSeconds } from '@/features/charging/session-timing';
import type { haptics } from '@/lib/haptics';

export const RELEASE_STEP_INTERVAL_MS = 1400;
export const RELEASE_STEP_COUNT = 4;

export type ReleaseStep = {
  label: string;
  hint: string;
};

export function getReleaseSteps(session: ChargingSession): ReleaseStep[] {
  const first =
    session.regime === 'COMMERCIAL'
      ? { label: 'Cartão autorizado', hint: 'Pré-autorização confirmada pelo banco' }
      : { label: 'Unidade validada', hint: `Recarga vinculada à unidade ${session.unitLabel}` };

  return [
    first,
    { label: 'Ponto reservado para você', hint: session.chargePoint.name },
    { label: 'Comando enviado ao carregador', hint: 'SEMS Remote Control' },
    { label: 'Carregador liberado', hint: 'Conecte e a medição começa' },
  ];
}

export function getReleaseStep(status: ChargingSessionStatus, elapsedMs: number) {
  if (status !== 'PENDING') return RELEASE_STEP_COUNT;
  const step = Math.floor(Math.max(0, elapsedMs) / RELEASE_STEP_INTERVAL_MS) + 1;
  return Math.min(RELEASE_STEP_COUNT - 1, step);
}

export function getRemainingEnergyKwh(session: ChargingSession) {
  if (session.targetEnergyKwh === null) return null;
  return Math.max(0, session.targetEnergyKwh - session.energyKwh);
}

export function getChargingProgress(session: ChargingSession) {
  if (session.targetEnergyKwh !== null && session.targetEnergyKwh > 0) {
    return Math.min(1, session.energyKwh / session.targetEnergyKwh);
  }
  if (session.socPercent !== null) return Math.min(1, session.socPercent / 100);
  return 0;
}

export function estimateChargingEndMs(session: ChargingSession, now: number) {
  const remaining = getRemainingEnergyKwh(session);
  if (remaining === null || session.powerKw <= 0) return null;
  const simulatedSeconds = (remaining / session.powerKw) * 3600;
  return now + (simulatedSeconds / Math.max(1, session.simulationSpeed)) * 1000;
}

export function getGraceProgress(session: ChargingSession, now: number) {
  const total = session.gracePeriodMinutes * 60;
  if (total <= 0) return 0;
  return Math.min(1, getGraceRemainingSeconds(session, now) / total);
}

export function getIdleFeeProgress(idleFeeCents: number, capCents: number) {
  if (capCents <= 0) return 0;
  return Math.min(1, idleFeeCents / capCents);
}

export type SessionHaptic = keyof typeof haptics;

export function getTransitionHaptic(
  previous: ChargingSessionStatus | undefined,
  next: ChargingSessionStatus | undefined,
): SessionHaptic | null {
  if (!previous || !next || previous === next) return null;
  if (next === 'ACTIVE' && (previous === 'PENDING' || previous === 'AWAITING_PAYMENT')) return 'success';
  if (next === 'GRACE' && previous === 'ACTIVE') return 'warning';
  if (previous === 'GRACE' && next === 'IDLE') return 'warning';
  if (next === 'CLOSED' && previous !== 'AWAITING_PAYMENT') return 'success';
  return null;
}

export function estimateLimitSocPercent(session: ChargingSessionDetail) {
  if (session.limit.type === 'PERCENT') return session.limit.socPercent;
  if (session.limit.type === 'FULL' || session.socPercent === null) return null;
  const remaining = getRemainingEnergyKwh(session);
  const first = session.readings.find((reading) => reading.socPercent !== null);
  if (remaining === null || !first || first.socPercent === null) return null;
  const socGain = session.socPercent - first.socPercent;
  const energyGain = session.energyKwh - first.energyKwh;
  if (socGain <= 0 || energyGain <= 0) return null;
  const capacityKwh = (energyGain / socGain) * 100;
  return Math.min(100, Math.round(session.socPercent + (remaining / capacityKwh) * 100));
}

export function getRemainingRealSeconds(iso: string | null, now: number) {
  if (!iso) return null;
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return null;
  return Math.max(0, (time - now) / 1000);
}
