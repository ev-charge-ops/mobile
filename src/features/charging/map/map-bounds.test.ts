import { getBoundsAround, toBbox } from '@/features/charging/map/map-bounds';

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
