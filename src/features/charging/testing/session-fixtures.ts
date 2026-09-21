import type { ChargingSessionDetail } from '@/features/charging/api/charging-api';

export function buildSession(overrides: Partial<ChargingSessionDetail> = {}): ChargingSessionDetail {
  return {
    id: 'session-1',
    status: 'ACTIVE',
    chargePoint: { id: 'cp-1', code: 'L1-01', name: 'Garagem L1 · Vaga 12' },
    organizationId: 'org-1',
    unitLabel: 'B · 42',
    regime: 'PRIVATE',
    limit: { type: 'FULL', energyKwh: null, amountCents: null },
    targetEnergyKwh: 12,
    startedAt: '2026-10-07T13:55:00.000Z',
    chargingEndedAt: null,
    graceEndsAt: null,
    endedAt: null,
    energyKwh: 1.478,
    powerKw: 7,
    allocatedPowerKw: 7,
    socPercent: 45,
    lockedRateCents: 89,
    demandFactor: 0.8,
    demandFactorSource: 'MODEL',
    demandModelVersion: 'v1',
    energyCostCents: 132,
    gracePeriodMinutes: 10,
    idleFeeCentsPerMinute: 25,
    idleFeeCapCents: 3000,
    idleMinutes: 0,
    idleFeeCents: 0,
    totalCents: 132,
    anomalyScore: null,
    isAnomaly: null,
    simulationSpeed: 60,
    payment: null,
    readings: [],
    ...overrides,
  };
}

export function buildClosedSession(overrides: Partial<ChargingSessionDetail> = {}): ChargingSessionDetail {
  return buildSession({
    status: 'CLOSED',
    chargingEndedAt: '2026-10-07T13:55:19.000Z',
    graceEndsAt: '2026-10-07T13:55:29.000Z',
    endedAt: '2026-10-07T13:56:13.000Z',
    energyKwh: 2,
    powerKw: 0,
    socPercent: 46,
    energyCostCents: 178,
    idleMinutes: 44,
    idleFeeCents: 1100,
    totalCents: 1278,
    ...overrides,
  });
}
