import type { ChargePoint } from '@/features/charging/api/charging-api';

export type ChargePointFilter = 'ALL' | 'PRIVATE' | 'COMMERCIAL' | 'AVAILABLE';

export const chargePointFilters: { id: ChargePointFilter; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'PRIVATE', label: 'Condomínio' },
  { id: 'COMMERCIAL', label: 'Comercial' },
  { id: 'AVAILABLE', label: 'Só livres' },
];

export function matchesFilter(chargePoint: ChargePoint, filter: ChargePointFilter) {
  if (filter === 'ALL') return true;
  if (filter === 'AVAILABLE') return chargePoint.status === 'AVAILABLE';
  return chargePoint.type === filter;
}

export function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function matchesSearch(chargePoint: ChargePoint, query: string) {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalizeSearchText(`${chargePoint.name} ${chargePoint.code} ${chargePoint.organizationName}`);
  return terms.every((term) => haystack.includes(term));
}

export function filterChargePoints(chargePoints: ChargePoint[], filter: ChargePointFilter, query: string) {
  return chargePoints.filter((chargePoint) => matchesFilter(chargePoint, filter) && matchesSearch(chargePoint, query));
}
