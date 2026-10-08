import {
  countActiveFilters,
  DEFAULT_CHARGE_POINT_FILTERS,
  filterChargePoints,
  matchesFilters,
  matchesSearch,
  normalizeSearchText,
} from '@/features/charging/charge-point-filters';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';

const privatePoint = buildChargePoint();
const busyCommercialPoint = buildCommercialChargePoint({
  status: 'CHARGING',
  organizationName: 'Shopping Paulista',
});

describe('matchesFilters', () => {
  const filters = DEFAULT_CHARGE_POINT_FILTERS;

  it('keeps every point without filters', () => {
    expect(matchesFilters(privatePoint, filters)).toBe(true);
    expect(matchesFilters(busyCommercialPoint, filters)).toBe(true);
    expect(countActiveFilters(filters)).toBe(0);
  });

  it('filters by regime', () => {
    expect(matchesFilters(privatePoint, { ...filters, regime: 'PRIVATE' })).toBe(true);
    expect(matchesFilters(busyCommercialPoint, { ...filters, regime: 'PRIVATE' })).toBe(false);
    expect(matchesFilters(busyCommercialPoint, { ...filters, regime: 'COMMERCIAL' })).toBe(true);
  });

  it('keeps only available points', () => {
    expect(matchesFilters(privatePoint, { ...filters, availableOnly: true })).toBe(true);
    expect(matchesFilters(busyCommercialPoint, { ...filters, availableOnly: true })).toBe(false);
  });

  it('splits 7 kW and 22 kW chargers', () => {
    expect(matchesFilters(privatePoint, { ...filters, power: 'AC_7' })).toBe(true);
    expect(matchesFilters(privatePoint, { ...filters, power: 'AC_22' })).toBe(false);
    expect(matchesFilters(busyCommercialPoint, { ...filters, power: 'AC_22' })).toBe(true);
  });

  it('combines every active filter', () => {
    const combined = { availableOnly: true, power: 'AC_22', regime: 'COMMERCIAL' } as const;

    expect(matchesFilters(busyCommercialPoint, combined)).toBe(false);
    expect(countActiveFilters(combined)).toBe(3);
  });
});

describe('matchesSearch', () => {
  it('ignores case, accents and extra spaces', () => {
    expect(normalizeSearchText('  Aclimação ')).toBe('aclimacao');
    expect(matchesSearch(privatePoint, 'ACLIMACAO')).toBe(true);
  });

  it('matches name, code and organization with every term', () => {
    expect(matchesSearch(privatePoint, 'vaga 12')).toBe(true);
    expect(matchesSearch(privatePoint, 'l1-01')).toBe(true);
    expect(matchesSearch(privatePoint, 'residencial vaga')).toBe(true);
    expect(matchesSearch(privatePoint, 'residencial paulista')).toBe(false);
  });

  it('keeps everything for a blank query', () => {
    expect(matchesSearch(privatePoint, '   ')).toBe(true);
  });
});

describe('filterChargePoints', () => {
  it('combines the filter and the search', () => {
    const points = [privatePoint, busyCommercialPoint];

    expect(filterChargePoints(points, DEFAULT_CHARGE_POINT_FILTERS, 'paulista')).toEqual([busyCommercialPoint]);
    const availableOnly = { ...DEFAULT_CHARGE_POINT_FILTERS, availableOnly: true };
    const privateOnly = { ...DEFAULT_CHARGE_POINT_FILTERS, regime: 'PRIVATE' } as const;

    expect(filterChargePoints(points, availableOnly, 'paulista')).toEqual([]);
    expect(filterChargePoints(points, privateOnly, '')).toEqual([privatePoint]);
  });
});
