import type { ChargePointType } from '@/features/charging/api/charging-api';
import type { ChargePointSummary } from '@/features/charging/charge-point-summary';

export type RegimeFilter = 'ALL' | ChargePointType;
export type PowerFilter = 'ANY' | 'AC_7' | 'AC_22';

export type ChargePointFilters = {
  availableOnly: boolean;
  power: PowerFilter;
  regime: RegimeFilter;
};

export const DEFAULT_CHARGE_POINT_FILTERS: ChargePointFilters = { availableOnly: false, power: 'ANY', regime: 'ALL' };

export const powerFilters: { id: Exclude<PowerFilter, 'ANY'>; label: string }[] = [
  { id: 'AC_7', label: '7 kW' },
  { id: 'AC_22', label: '22 kW' },
];

export const regimeFilters: { id: RegimeFilter; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'PRIVATE', label: 'Condomínio' },
  { id: 'COMMERCIAL', label: 'Comercial' },
];

const FAST_AC_MIN_KW = 11;

export function matchesPower(chargePoint: ChargePointSummary, power: PowerFilter) {
  if (power === 'ANY') return true;
  const isFast = chargePoint.maxPowerKw >= FAST_AC_MIN_KW;
  return power === 'AC_22' ? isFast : !isFast;
}

export function matchesFilters(chargePoint: ChargePointSummary, filters: ChargePointFilters) {
  if (filters.availableOnly && chargePoint.status !== 'AVAILABLE') return false;
  if (filters.regime !== 'ALL' && chargePoint.type !== filters.regime) return false;
  return matchesPower(chargePoint, filters.power);
}

export function countActiveFilters(filters: ChargePointFilters) {
  return Number(filters.availableOnly) + Number(filters.power !== 'ANY') + Number(filters.regime !== 'ALL');
}

export function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function matchesSearch(chargePoint: ChargePointSummary, query: string) {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalizeSearchText(`${chargePoint.name} ${chargePoint.code} ${chargePoint.operatorName}`);
  return terms.every((term) => haystack.includes(term));
}

export function filterChargePoints(chargePoints: ChargePointSummary[], filters: ChargePointFilters, query: string) {
  return chargePoints.filter(
    (chargePoint) => matchesFilters(chargePoint, filters) && matchesSearch(chargePoint, query),
  );
}
