import { getMapCenterSource } from '@/config/map-center';

describe('getMapCenterSource', () => {
  it('follows the device for DEVICE users', () => {
    expect(getMapCenterSource('DEVICE')).toBe('device');
  });

  it('keeps the demo center for DEMO users and before the profile loads', () => {
    expect(getMapCenterSource('DEMO')).toBe('demo');
    expect(getMapCenterSource(undefined)).toBe('demo');
  });
});
