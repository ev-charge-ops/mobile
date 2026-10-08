import {
  estimateChargingEndMs,
  getChargingProgress,
  getGraceProgress,
  getIdleFeeProgress,
  getReleaseStep,
  getReleaseSteps,
  getRemainingEnergyKwh,
  getTransitionHaptic,
  RELEASE_STEP_INTERVAL_MS,
} from '@/features/charging/session-progress';
import { buildSession } from '@/features/charging/testing/session-fixtures';

describe('release steps', () => {
  it('describes the card step for commercial points', () => {
    expect(getReleaseSteps(buildSession({ regime: 'COMMERCIAL' }))[0].label).toBe('Cartão autorizado');
    expect(getReleaseSteps(buildSession({ regime: 'PRIVATE' }))[0].hint).toBe('Recarga vinculada à unidade B · 42');
  });

  it('advances while pending and holds on the last step', () => {
    expect(getReleaseStep('PENDING', 0)).toBe(1);
    expect(getReleaseStep('PENDING', RELEASE_STEP_INTERVAL_MS)).toBe(2);
    expect(getReleaseStep('PENDING', RELEASE_STEP_INTERVAL_MS * 10)).toBe(3);
    expect(getReleaseStep('ACTIVE', 0)).toBe(4);
  });
});

describe('charging progress', () => {
  it('measures energy against the target', () => {
    const session = buildSession({ energyKwh: 3, targetEnergyKwh: 12 });

    expect(getChargingProgress(session)).toBe(0.25);
    expect(getRemainingEnergyKwh(session)).toBe(9);
  });

  it('falls back to the battery level without a target', () => {
    const session = buildSession({ targetEnergyKwh: null, socPercent: 60 });

    expect(getChargingProgress(session)).toBe(0.6);
    expect(getRemainingEnergyKwh(session)).toBeNull();
  });

  it('estimates the end in real time from power and simulation speed', () => {
    const session = buildSession({ energyKwh: 5, targetEnergyKwh: 12, powerKw: 7, simulationSpeed: 60 });

    expect(estimateChargingEndMs(session, 0)).toBe(60_000);
    expect(estimateChargingEndMs({ ...session, powerKw: 0 }, 0)).toBeNull();
  });
});

describe('countdown progress', () => {
  it('empties during the grace period', () => {
    const now = Date.parse('2026-10-07T14:00:00.000Z');
    const session = buildSession({
      status: 'GRACE',
      gracePeriodMinutes: 10,
      simulationSpeed: 60,
      graceEndsAt: new Date(now + 5_000).toISOString(),
    });

    expect(getGraceProgress(session, now)).toBe(0.5);
  });

  it('fills up to the idle fee cap', () => {
    expect(getIdleFeeProgress(750, 3000)).toBe(0.25);
    expect(getIdleFeeProgress(5000, 3000)).toBe(1);
    expect(getIdleFeeProgress(100, 0)).toBe(0);
  });
});

describe('transition haptics', () => {
  it('celebrates when charging starts', () => {
    expect(getTransitionHaptic('PENDING', 'ACTIVE')).toBe('success');
    expect(getTransitionHaptic('AWAITING_PAYMENT', 'ACTIVE')).toBe('success');
  });

  it('warns when the idle fee starts', () => {
    expect(getTransitionHaptic('GRACE', 'IDLE')).toBe('warning');
  });

  it('warns when the tolerance starts and celebrates the receipt', () => {
    expect(getTransitionHaptic('ACTIVE', 'GRACE')).toBe('warning');
    expect(getTransitionHaptic('IDLE', 'CLOSED')).toBe('success');
    expect(getTransitionHaptic('AWAITING_PAYMENT', 'CLOSED')).toBeNull();
  });

  it('stays silent otherwise', () => {
    expect(getTransitionHaptic(undefined, 'ACTIVE')).toBeNull();
    expect(getTransitionHaptic('ACTIVE', 'ACTIVE')).toBeNull();
    expect(getTransitionHaptic('PENDING', 'INTERRUPTED')).toBeNull();
  });
});
