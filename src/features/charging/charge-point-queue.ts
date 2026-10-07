import { ChargingApiError, type ChargePoint } from '@/features/charging/api/charging-api';

export const QUEUE_RESERVATION_MINUTES = 10;

export type QueueState =
  | { kind: 'reserved-for-me'; reservedUntil: string }
  | { kind: 'waiting'; position: number; queueLength: number }
  | { kind: 'reserved-for-other'; reservedUntil: string }
  | { kind: 'can-join'; queueLength: number }
  | { kind: 'none' };

function isFuture(iso: string | null, now: number): iso is string {
  return iso !== null && Date.parse(iso) > now;
}

export function getQueueState(chargePoint: ChargePoint, now: number): QueueState {
  const entry = chargePoint.myQueueEntry;

  if (entry?.status === 'NOTIFIED' && isFuture(entry.reservedUntil, now)) {
    return { kind: 'reserved-for-me', reservedUntil: entry.reservedUntil };
  }

  if (entry?.status === 'WAITING') {
    return {
      kind: 'waiting',
      position: entry.position ?? 1,
      queueLength: Math.max(entry.queueLength, chargePoint.queueLength),
    };
  }

  if (chargePoint.status === 'AVAILABLE' && isFuture(chargePoint.reservedUntil, now)) {
    return { kind: 'reserved-for-other', reservedUntil: chargePoint.reservedUntil };
  }

  if ((chargePoint.status === 'CHARGING' || chargePoint.status === 'IDLE') && chargePoint.pricing) {
    return { kind: 'can-join', queueLength: chargePoint.queueLength };
  }

  return { kind: 'none' };
}

export function getRemainingSeconds(iso: string, now: number) {
  return Math.max(0, Math.ceil((Date.parse(iso) - now) / 1000));
}

export function formatPosition(position: number) {
  return `${position}º`;
}

export function formatQueueLength(queueLength: number) {
  return queueLength === 1 ? '1 na fila' : `${queueLength} na fila`;
}

const queueMessages: Record<string, string> = {
  CHARGE_POINT_AVAILABLE: 'O ponto acabou de liberar. Você já pode iniciar a recarga.',
  CHARGE_POINT_OFFLINE: 'O carregador está offline no momento.',
  QUEUE_OWN_SESSION: 'Você já está carregando neste ponto.',
  ALREADY_IN_QUEUE: 'Você já está na fila deste ponto.',
  ACTIVE_QUEUE_EXISTS: 'Você já está na fila de outro ponto. Saia dela para entrar nesta.',
};

export function getQueueErrorMessage(error: unknown) {
  if (!(error instanceof ChargingApiError)) return 'Algo deu errado. Tente novamente.';
  if (error.status === null) return 'Não foi possível conectar ao servidor. Tente novamente.';
  if (error.code && queueMessages[error.code]) return queueMessages[error.code];
  return 'Não foi possível entrar na fila. Tente novamente.';
}

export function getLeaveQueueErrorMessage(error: unknown) {
  if (error instanceof ChargingApiError && error.status === null) {
    return 'Não foi possível conectar ao servidor. Tente novamente.';
  }
  return 'Não foi possível sair da fila. Tente novamente.';
}
