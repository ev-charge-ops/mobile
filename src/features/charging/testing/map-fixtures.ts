import type { ChargePoint, ChargePointMapItem } from '@/features/charging/api/charging-api';

export function buildMapItem(overrides: Partial<ChargePointMapItem> = {}): ChargePointMapItem {
  return {
    id: 'map-1',
    code: 'OCM-1',
    name: 'Posto Central · Carregador 1',
    type: 'COMMERCIAL',
    status: 'AVAILABLE',
    latitude: -23.5612,
    longitude: -46.6559,
    maxPowerKw: 22,
    connector: 'TYPE_2',
    operatorName: 'Rede Central',
    basePricePerKwhCents: 189,
    pricePerKwhCents: 227,
    photoUrl: null,
    source: 'OCM',
    ...overrides,
  };
}

export function toMapItem(chargePoint: ChargePoint): ChargePointMapItem {
  return {
    id: chargePoint.id,
    code: chargePoint.code,
    name: chargePoint.name,
    type: chargePoint.type,
    status: chargePoint.status,
    latitude: chargePoint.latitude,
    longitude: chargePoint.longitude,
    maxPowerKw: chargePoint.maxPowerKw,
    connector: chargePoint.charger?.connector ?? null,
    operatorName: chargePoint.organizationName,
    basePricePerKwhCents: chargePoint.pricing
      ? (chargePoint.pricing.baseRateCents ?? chargePoint.pricing.utilityRateCents)
      : null,
    pricePerKwhCents: chargePoint.pricing?.pricePerKwhCents ?? null,
    photoUrl: chargePoint.photoUrl,
    source: chargePoint.attribution ? 'OCM' : 'SEED',
  };
}
