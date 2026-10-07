import {
  filterChargePoints,
  matchesFilter,
  matchesSearch,
  normalizeSearchText,
} from '@/features/charging/charge-point-filters';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';

const privatePoint = buildChargePoint();
const busyCommercialPoint = buildCommercialChargePoint({
  status: 'CHARGING',
  organizationName: 'Shopping Paulista',
});

describe('matchesFilter', () => {
  it('keeps every point for all', () => {
    expect(matchesFilter(privatePoint, 'ALL')).toBe(true);
    expect(matchesFilter(busyCommercialPoint, 'ALL')).toBe(true);
  });

  it('filters by regime', () => {
    expect(matchesFilter(privatePoint, 'PRIVATE')).toBe(true);
    expect(matchesFilter(busyCommercialPoint, 'PRIVATE')).toBe(false);
    expect(matchesFilter(busyCommercialPoint, 'COMMERCIAL')).toBe(true);
  });

  it('keeps only available points', () => {
    expect(matchesFilter(privatePoint, 'AVAILABLE')).toBe(true);
    expect(matchesFilter(busyCommercialPoint, 'AVAILABLE')).toBe(false);
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

    expect(filterChargePoints(points, 'ALL', 'paulista')).toEqual([busyCommercialPoint]);
    expect(filterChargePoints(points, 'AVAILABLE', 'paulista')).toEqual([]);
    expect(filterChargePoints(points, 'PRIVATE', '')).toEqual([privatePoint]);
  });
});
