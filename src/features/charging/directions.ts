import { Linking, Platform } from 'react-native';

import type { Coordinates } from '@/features/charging/map/map-region';

export type DirectionsApp = 'apple' | 'google' | 'waze';

export const directionsAppLabels: Record<DirectionsApp, string> = {
  apple: 'Apple Maps',
  google: 'Google Maps',
  waze: 'Waze',
};

export function getDirectionsApps(os: string = Platform.OS): DirectionsApp[] {
  return os === 'ios' ? ['apple', 'google', 'waze'] : ['google', 'waze'];
}

export function getDirectionsUrl(app: DirectionsApp, { latitude, longitude }: Coordinates) {
  const destination = `${latitude},${longitude}`;
  if (app === 'apple') return `https://maps.apple.com/?daddr=${destination}&dirflg=d`;
  if (app === 'waze') return `https://waze.com/ul?ll=${destination}&navigate=yes`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

export function openDirections(app: DirectionsApp, coordinates: Coordinates) {
  return Linking.openURL(getDirectionsUrl(app, coordinates));
}
