import { getDirectionsApps, getDirectionsUrl } from '@/features/charging/directions';

const point = { latitude: -23.56905, longitude: -46.63145 };

describe('getDirectionsApps', () => {
  it('offers Apple Maps, Google Maps and Waze on iOS', () => {
    expect(getDirectionsApps('ios')).toEqual(['apple', 'google', 'waze']);
  });

  it('offers Google Maps and Waze on Android', () => {
    expect(getDirectionsApps('android')).toEqual(['google', 'waze']);
  });
});

describe('getDirectionsUrl', () => {
  it('builds the Apple Maps route', () => {
    expect(getDirectionsUrl('apple', point)).toBe('https://maps.apple.com/?daddr=-23.56905,-46.63145&dirflg=d');
  });

  it('builds the Google Maps route', () => {
    expect(getDirectionsUrl('google', point)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=-23.56905,-46.63145&travelmode=driving',
    );
  });

  it('builds the Waze route', () => {
    expect(getDirectionsUrl('waze', point)).toBe('https://waze.com/ul?ll=-23.56905,-46.63145&navigate=yes');
  });
});
