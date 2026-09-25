import { ChargingApiError } from '@/features/charging/api/charging-api';
import {
  formatPosition,
  formatQueueLength,
  getLeaveQueueErrorMessage,
  getQueueErrorMessage,
  getQueueState,
  getRemainingSeconds,
} from '@/features/charging/charge-point-queue';
import { getStartSessionErrorMessage } from '@/features/charging/charging-errors';
import { buildChargePoint, buildQueueEntry } from '@/features/charging/testing/fixtures';

const NOW = Date.parse('2026-10-07T20:00:00.000Z');
const IN_FIVE_MINUTES = '2026-10-07T20:05:00.000Z';
const FIVE_MINUTES_AGO = '2026-10-07T19:55:00.000Z';

describe('getQueueState', () => {
  it('lets the user join a busy point', () => {
    expect(getQueueState(buildChargePoint({ status: 'CHARGING', queueLength: 2 }), NOW)).toEqual({
      kind: 'can-join',
      queueLength: 2,
    });
    expect(getQueueState(buildChargePoint({ status: 'IDLE' }), NOW)).toEqual({ kind: 'can-join', queueLength: 0 });
  });

  it('has nothing to offer for free, offline or unpriced points', () => {
    expect(getQueueState(buildChargePoint(), NOW)).toEqual({ kind: 'none' });
    expect(getQueueState(buildChargePoint({ status: 'OFFLINE' }), NOW)).toEqual({ kind: 'none' });
    expect(getQueueState(buildChargePoint({ status: 'CHARGING', pricing: null }), NOW)).toEqual({ kind: 'none' });
  });

  it('shows the position while waiting', () => {
    const chargePoint = buildChargePoint({
      status: 'CHARGING',
      queueLength: 3,
      myQueueEntry: buildQueueEntry({ position: 2, queueLength: 3 }),
    });

    expect(getQueueState(chargePoint, NOW)).toEqual({ kind: 'waiting', position: 2, queueLength: 3 });
  });

  it('holds the point for the notified user until the reservation ends', () => {
    const chargePoint = buildChargePoint({
      reservedUntil: IN_FIVE_MINUTES,
      myQueueEntry: buildQueueEntry({ status: 'NOTIFIED', reservedUntil: IN_FIVE_MINUTES }),
    });

    expect(getQueueState(chargePoint, NOW)).toEqual({ kind: 'reserved-for-me', reservedUntil: IN_FIVE_MINUTES });
    expect(getQueueState(chargePoint, Date.parse(IN_FIVE_MINUTES) + 1000)).toEqual({ kind: 'none' });
  });

  it('blocks a point reserved for someone else', () => {
    expect(getQueueState(buildChargePoint({ reservedUntil: IN_FIVE_MINUTES }), NOW)).toEqual({
      kind: 'reserved-for-other',
      reservedUntil: IN_FIVE_MINUTES,
    });
    expect(getQueueState(buildChargePoint({ reservedUntil: FIVE_MINUTES_AGO }), NOW)).toEqual({ kind: 'none' });
  });
});

describe('queue formatting', () => {
  it('formats positions, lengths and the remaining time', () => {
    expect(formatPosition(2)).toBe('2º');
    expect(formatQueueLength(1)).toBe('1 na fila');
    expect(formatQueueLength(3)).toBe('3 na fila');
    expect(getRemainingSeconds(IN_FIVE_MINUTES, NOW)).toBe(300);
    expect(getRemainingSeconds(FIVE_MINUTES_AGO, NOW)).toBe(0);
  });
});

describe('queue errors', () => {
  it.each([
    ['CHARGE_POINT_AVAILABLE', 'O ponto acabou de liberar. Você já pode iniciar a recarga.'],
    ['CHARGE_POINT_OFFLINE', 'O carregador está offline no momento.'],
    ['QUEUE_OWN_SESSION', 'Você já está carregando neste ponto.'],
    ['ALREADY_IN_QUEUE', 'Você já está na fila deste ponto.'],
    ['ACTIVE_QUEUE_EXISTS', 'Você já está na fila de outro ponto. Saia dela para entrar nesta.'],
  ])('explains %s', (code, message) => {
    expect(getQueueErrorMessage(new ChargingApiError(409, code))).toBe(message);
  });

  it('falls back for network and unknown errors', () => {
    expect(getQueueErrorMessage(new ChargingApiError(null))).toBe(
      'Não foi possível conectar ao servidor. Tente novamente.',
    );
    expect(getQueueErrorMessage(new ChargingApiError(500))).toBe('Não foi possível entrar na fila. Tente novamente.');
    expect(getLeaveQueueErrorMessage(new ChargingApiError(500))).toBe('Não foi possível sair da fila. Tente novamente.');
  });

  it('explains a start blocked by a reservation', () => {
    expect(getStartSessionErrorMessage(new ChargingApiError(409, 'CHARGE_POINT_RESERVED'))).toBe(
      'Este ponto está reservado para o próximo da fila.',
    );
  });
});
