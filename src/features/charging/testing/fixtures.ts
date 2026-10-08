import type { ChargePoint, QueueEntry } from '@/features/charging/api/charging-api';

export function buildQueueEntry(overrides: Partial<QueueEntry> = {}): QueueEntry {
  return {
    id: 'queue-1',
    chargePointId: 'cp-1',
    status: 'WAITING',
    position: 1,
    queueLength: 1,
    reservedUntil: null,
    notifiedAt: null,
    endedAt: null,
    createdAt: '2026-10-07T20:00:00.000Z',
    ...overrides,
  };
}

export function buildChargePoint(overrides: Partial<ChargePoint> = {}): ChargePoint {
  return {
    id: 'cp-1',
    organizationId: 'org-1',
    organizationName: 'Residencial Aclimação',
    code: 'L1-01',
    name: 'Garagem L1 · Vaga 12',
    type: 'PRIVATE',
    latitude: -23.56905,
    longitude: -46.63145,
    maxPowerKw: 7,
    photoUrl: null,
    attribution: null,
    status: 'AVAILABLE',
    isMember: true,
    charger: { id: 'ch-1', vendor: 'GoodWe HCA G2', serialNumber: 'GW-HCA-G2-0001', connector: 'TYPE_2' },
    pricing: {
      pricePerKwhCents: 89,
      utilityRateCents: 89,
      baseRateCents: null,
      demandFactor: 0.8,
      demandLevel: 'OFF_PEAK',
      demandFactorSource: 'MODEL',
      demandModelVersion: 'v1',
      demandFactorApplied: false,
      idleFeeCentsPerMinute: 25,
      idleFeeCapCents: 3000,
      gracePeriodMinutes: 10,
    },
    queueLength: 0,
    reservedUntil: null,
    myQueueEntry: null,
    ...overrides,
  };
}

export function buildCommercialChargePoint(overrides: Partial<ChargePoint> = {}): ChargePoint {
  return buildChargePoint({
    id: 'cp-3',
    code: 'L2-01',
    name: 'Garagem L2 · Visitantes',
    type: 'COMMERCIAL',
    maxPowerKw: 22,
    pricing: {
      pricePerKwhCents: 284,
      utilityRateCents: 89,
      baseRateCents: 189,
      demandFactor: 1.5,
      demandLevel: 'PEAK',
      demandFactorSource: 'RULE',
      demandModelVersion: null,
      demandFactorApplied: true,
      idleFeeCentsPerMinute: 25,
      idleFeeCapCents: 3000,
      gracePeriodMinutes: 10,
    },
    ...overrides,
  });
}
