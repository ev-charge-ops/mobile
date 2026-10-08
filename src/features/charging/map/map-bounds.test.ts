import {
  getBoundsAround,
  getRegionBounds,
  getRegionZoom,
  getZoomedRegion,
  toBbox,
} from '@/features/charging/map/map-bounds';

describe('getBoundsAround', () => {
  it('spans the radius around the center, wider in longitude away from the equator', () => {
    const bounds = getBoundsAround({ latitude: -23.5, longitude: -46.6 }, 50_000);

    expect(bounds.maxLatitude - bounds.minLatitude).toBeCloseTo(0.898, 2);
    expect(bounds.maxLongitude - bounds.minLongitude).toBeGreaterThan(0.95);
    expect((bounds.minLatitude + bounds.maxLatitude) / 2).toBeCloseTo(-23.5, 5);
  });

  it('stays inside valid coordinates', () => {
    const bounds = getBoundsAround({ latitude: -80, longitude: 170 }, 4_000_000);

    expect(bounds.minLatitude).toBe(-90);
    expect(bounds.maxLongitude).toBe(180);
  });
});

describe('toBbox', () => {
  it('formats minLng,minLat,maxLng,maxLat', () => {
    expect(toBbox({ minLongitude: -46.750001, minLatitude: -23.65, maxLongitude: -46.55, maxLatitude: -23.45 })).toBe(
      '-46.75,-23.65,-46.55,-23.45',
    );
  });
});

describe('viewport helpers', () => {
  const region = { latitude: -23.5, longitude: -46.6, latitudeDelta: 0.2, longitudeDelta: 0.4 };

  it('reads the zoom level from the longitude span', () => {
    expect(getRegionZoom({ ...region, longitudeDelta: 360 })).toBe(0);
    expect(getRegionZoom({ ...region, longitudeDelta: 360 / 2 ** 9 })).toBeCloseTo(9, 6);
    expect(getRegionZoom({ ...region, longitudeDelta: 1e-9 })).toBe(20);
  });

  it('turns a region into its bounds', () => {
    const bounds = getRegionBounds(region);

    expect(bounds.minLongitude).toBeCloseTo(-46.8, 6);
    expect(bounds.maxLongitude).toBeCloseTo(-46.4, 6);
    expect(bounds.minLatitude).toBeCloseTo(-23.6, 6);
    expect(bounds.maxLatitude).toBeCloseTo(-23.4, 6);
  });

  it('builds a region around a point at a zoom level', () => {
    expect(getZoomedRegion({ latitude: -22.9, longitude: -43.2 }, 5)).toEqual({
      latitude: -22.9,
      longitude: -43.2,
      latitudeDelta: 11.25,
      longitudeDelta: 11.25,
    });
  });
});
