import {
  formatDistance,
  getDistanceMeters,
  rankChargePointsByDistance,
} from '@/features/charging/charge-point-distance';
import { DEFAULT_CHARGE_POINT_FILTERS, filterChargePoints } from '@/features/charging/charge-point-filters';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';

const aclimacao = { latitude: -23.5692, longitude: -46.6312 };

describe('getDistanceMeters', () => {
  it('is zero for the same place', () => {
    expect(getDistanceMeters(aclimacao, aclimacao)).toBe(0);
  });

  it('measures one degree of latitude as about 111 km', () => {
    expect(getDistanceMeters({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 })).toBeCloseTo(111_195, -1);
  });

  it('measures a known city distance and is symmetric', () => {
    const paulista = { latitude: -23.5612, longitude: -46.6559 };
    const distance = getDistanceMeters(aclimacao, paulista);
    expect(distance).toBeGreaterThan(2_600);
    expect(distance).toBeLessThan(2_700);
    expect(getDistanceMeters(paulista, aclimacao)).toBeCloseTo(distance, 6);
  });
});

describe('formatDistance', () => {
  it('rounds meters to the nearest 10 m below 1 km', () => {
    expect(formatDistance(347)).toBe('350 m');
    expect(formatDistance(12)).toBe('10 m');
    expect(formatDistance(0)).toBe('10 m');
    expect(formatDistance(994)).toBe('990 m');
  });

  it('shows kilometers with one decimal and a comma', () => {
    expect(formatDistance(995)).toBe('1,0 km');
    expect(formatDistance(1_234)).toBe('1,2 km');
    expect(formatDistance(2_650)).toBe('2,7 km');
    expect(formatDistance(15_000)).toBe('15,0 km');
  });
});

describe('rankChargePointsByDistance', () => {
  const far = buildCommercialChargePoint({ id: 'far', latitude: -23.5612, longitude: -46.6559 });
  const near = buildChargePoint({ id: 'near', latitude: -23.5693, longitude: -46.6313 });
  const middle = buildChargePoint({ id: 'middle', status: 'CHARGING', latitude: -23.575, longitude: -46.635 });

  it('sorts the nearest point first', () => {
    const ranked = rankChargePointsByDistance([far, middle, near], aclimacao);

    expect(ranked.map((item) => item.chargePoint.id)).toEqual(['near', 'middle', 'far']);
    expect(ranked[0].distanceMeters).toBeLessThan(20);
  });

  it('sorts what is left after the search and the filter chips', () => {
    const visible = filterChargePoints(
      [far, middle, near],
      { ...DEFAULT_CHARGE_POINT_FILTERS, availableOnly: true },
      '',
    );

    expect(rankChargePointsByDistance(visible, aclimacao).map((item) => item.chargePoint.id)).toEqual(['near', 'far']);
  });

  it('keeps the API order without a reference position', () => {
    const ranked = rankChargePointsByDistance([far, middle, near], null);

    expect(ranked.map((item) => item.chargePoint.id)).toEqual(['far', 'middle', 'near']);
    expect(ranked.every((item) => item.distanceMeters === null)).toBe(true);
  });
});
