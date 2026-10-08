import { getDirectionsUrl } from '@/features/charging/directions';

const point = { latitude: -23.56905, longitude: -46.63145 };

describe('getDirectionsUrl', () => {
  it('opens Apple Maps on iOS', () => {
    expect(getDirectionsUrl(point, 'ios')).toBe('https://maps.apple.com/?daddr=-23.56905,-46.63145&dirflg=d');
  });

  it('opens Google Maps elsewhere', () => {
    expect(getDirectionsUrl(point, 'android')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=-23.56905,-46.63145&travelmode=driving',
    );
  });
});
