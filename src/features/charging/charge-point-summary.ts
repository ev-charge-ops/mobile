import type {
  ChargePoint,
  ChargePointMapItem,
  ChargePointStatus,
  ChargePointType,
  ConnectorType,
} from '@/features/charging/api/charging-api';

export type ChargePointSummary = {
  id: string;
  code: string;
  name: string;
  type: ChargePointType;
  status: ChargePointStatus;
  latitude: number;
  longitude: number;
  maxPowerKw: number;
  photoUrl: string | null;
  connector: ConnectorType | null;
  operatorName: string;
  pricePerKwhCents: number | null;
  basePricePerKwhCents: number | null;
  demandFactor: number | null;
  isPeak: boolean;
  queueLength: number;
  isDemoPrice: boolean;
};

const PEAK_FACTOR_ABOVE = 1.2;

function getDemandFactor(item: ChargePointMapItem) {
  if (item.pricePerKwhCents === null || !item.basePricePerKwhCents) return null;
  return item.pricePerKwhCents / item.basePricePerKwhCents;
}

export function summarizeChargePoint(chargePoint: ChargePoint): ChargePointSummary {
  const { pricing } = chargePoint;
  return {
    id: chargePoint.id,
    code: chargePoint.code,
    name: chargePoint.name,
    type: chargePoint.type,
    status: chargePoint.status,
    latitude: chargePoint.latitude,
    longitude: chargePoint.longitude,
    maxPowerKw: chargePoint.maxPowerKw,
    photoUrl: chargePoint.photoUrl,
    connector: chargePoint.charger?.connector ?? null,
    operatorName: chargePoint.organizationName,
    pricePerKwhCents: pricing?.pricePerKwhCents ?? null,
    basePricePerKwhCents: pricing ? (pricing.baseRateCents ?? pricing.utilityRateCents) : null,
    demandFactor: pricing?.demandFactor ?? null,
    isPeak: pricing?.demandLevel === 'PEAK',
    queueLength: chargePoint.queueLength,
    isDemoPrice: chargePoint.attribution !== null,
  };
}

export function summarizeMapItem(item: ChargePointMapItem, detail?: ChargePoint): ChargePointSummary {
  if (detail) {
    return { ...summarizeChargePoint(detail), status: item.status, isDemoPrice: item.source === 'OCM' };
  }
  const demandFactor = getDemandFactor(item);
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    type: item.type,
    status: item.status,
    latitude: item.latitude,
    longitude: item.longitude,
    maxPowerKw: item.maxPowerKw,
    photoUrl: item.photoUrl,
    connector: item.connector,
    operatorName: item.operatorName,
    pricePerKwhCents: item.pricePerKwhCents,
    basePricePerKwhCents: item.basePricePerKwhCents,
    demandFactor,
    isPeak: demandFactor !== null && demandFactor > PEAK_FACTOR_ABOVE,
    queueLength: 0,
    isDemoPrice: item.source === 'OCM',
  };
}

export function summarizeMapItems(items: ChargePointMapItem[], details: ChargePoint[] | undefined) {
  const detailsById = new Map((details ?? []).map((detail) => [detail.id, detail]));
  return items.map((item) => summarizeMapItem(item, detailsById.get(item.id)));
}
