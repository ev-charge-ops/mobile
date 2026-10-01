import { selectNearbyChargePoints } from '@/features/charging/charge-point-nearby';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';

const near = buildChargePoint({ id: 'near', latitude: -23.5692, longitude: -46.6312 });
const far = buildChargePoint({ id: 'far', latitude: -23.58, longitude: -46.64 });
const outsider = buildCommercialChargePoint({ id: 'outsider', isMember: false, latitude: -23.5692, longitude: -46.6312 });

describe('selectNearbyChargePoints', () => {
  it('keeps only the points of the driver organizations, nearest first', () => {
    const result = selectNearbyChargePoints([far, outsider, near], { latitude: -23.5692, longitude: -46.6312 });

    expect(result.map((item) => item.chargePoint.id)).toEqual(['near', 'far']);
    expect(result[0].distanceMeters).toBe(0);
  });

  it('keeps the API order without a location', () => {
    const result = selectNearbyChargePoints([far, near], null);

    expect(result.map((item) => item.chargePoint.id)).toEqual(['far', 'near']);
    expect(result[0].distanceMeters).toBeNull();
  });

  it('falls back to every point when the driver has no organization points', () => {
    expect(selectNearbyChargePoints([outsider], null).map((item) => item.chargePoint.id)).toEqual(['outsider']);
  });

  it('limits the list', () => {
    const points = Array.from({ length: 6 }, (_, index) => buildChargePoint({ id: `cp-${index}` }));

    expect(selectNearbyChargePoints(points, null, 3)).toHaveLength(3);
  });
});
