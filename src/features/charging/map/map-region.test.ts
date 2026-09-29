import {
  DEFAULT_REGION,
  getAreaRegion,
  getFocusRegion,
  getRegionForCoordinates,
  getUserRegion,
} from '@/features/charging/map/map-region';

describe('getRegionForCoordinates', () => {
  it('falls back to the default region without points', () => {
    expect(getRegionForCoordinates([])).toEqual(DEFAULT_REGION);
  });

  it('wraps every point with padding', () => {
    const region = getRegionForCoordinates([
      { latitude: -23.56, longitude: -46.64 },
      { latitude: -23.58, longitude: -46.62 },
    ]);

    expect(region.latitudeDelta).toBeCloseTo(0.032);
    expect(region.longitudeDelta).toBeCloseTo(0.032);
    expect(region.longitude).toBeCloseTo(-46.63);
    expect(region.latitude).toBeLessThan(-23.57);
    expect(region.latitude - region.latitudeDelta / 2).toBeLessThan(-23.58);
    expect(region.latitude + region.latitudeDelta / 2).toBeGreaterThan(-23.56);
  });

  it('keeps a minimum zoom for a single point', () => {
    const region = getRegionForCoordinates([{ latitude: -23.56905, longitude: -46.63145 }]);

    expect(region.latitudeDelta).toBe(0.008);
    expect(region.longitudeDelta).toBe(0.008);
  });
});

describe('focus regions', () => {
  it('centers slightly above the point to leave room for the preview card', () => {
    const point = { latitude: -23.56905, longitude: -46.63145 };

    const focus = getFocusRegion(point);
    expect(focus.longitude).toBe(point.longitude);
    expect(focus.latitude).toBeLessThan(point.latitude);
    expect(focus.latitudeDelta).toBe(0.011);

    expect(getUserRegion(point).latitudeDelta).toBe(0.008);
  });

  it('opens a neighbourhood wide area around the demo center', () => {
    const area = getAreaRegion({ latitude: -23.5692, longitude: -46.6312 });

    expect(area.longitude).toBe(-46.6312);
    expect(area.latitude).toBeLessThan(-23.5692);
    expect(area.latitudeDelta).toBe(0.034);
    expect(area.longitudeDelta).toBe(0.034);
  });
});
