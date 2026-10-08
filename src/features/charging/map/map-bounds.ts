import type { Region } from 'react-native-maps';

import type { Coordinates } from '@/features/charging/map/map-region';

export type Bounds = {
  minLongitude: number;
  minLatitude: number;
  maxLongitude: number;
  maxLatitude: number;
};

const METERS_PER_DEGREE_LATITUDE = 111_320;
const MIN_LONGITUDE_SCALE = 0.01;

export const BRAZIL_REGION: Region = {
  latitude: -14.235,
  longitude: -51.9253,
  latitudeDelta: 38,
  longitudeDelta: 38,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function getBoundsAround(center: Coordinates, radiusMeters: number): Bounds {
  const latitudeSpan = radiusMeters / METERS_PER_DEGREE_LATITUDE;
  const longitudeScale = Math.max(Math.cos((center.latitude * Math.PI) / 180), MIN_LONGITUDE_SCALE);
  const longitudeSpan = latitudeSpan / longitudeScale;
  return {
    minLongitude: clamp(center.longitude - longitudeSpan, -180, 180),
    minLatitude: clamp(center.latitude - latitudeSpan, -90, 90),
    maxLongitude: clamp(center.longitude + longitudeSpan, -180, 180),
    maxLatitude: clamp(center.latitude + latitudeSpan, -90, 90),
  };
}

export function toBbox(bounds: Bounds): string {
  return [bounds.minLongitude, bounds.minLatitude, bounds.maxLongitude, bounds.maxLatitude]
    .map((value) => Number(value.toFixed(5)))
    .join(',');
}
