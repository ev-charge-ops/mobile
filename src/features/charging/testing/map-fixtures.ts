import type { ChargePointMapItem } from '@/features/charging/api/charging-api';

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
