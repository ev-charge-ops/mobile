import { Linking, Platform } from 'react-native';

import type { Coordinates } from '@/features/charging/map/map-region';

export function getDirectionsUrl({ latitude, longitude }: Coordinates, os: string = Platform.OS) {
  const destination = `${latitude},${longitude}`;
  if (os === 'ios') return `https://maps.apple.com/?daddr=${destination}&dirflg=d`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

export function openDirections(coordinates: Coordinates) {
  return Linking.openURL(getDirectionsUrl(coordinates));
}
