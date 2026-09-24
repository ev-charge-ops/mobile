import type { Region } from 'react-native-maps';

export type Coordinates = { latitude: number; longitude: number };

export const MAP_ANIMATION_DURATION = 420;

export const DEFAULT_REGION: Region = {
  latitude: -23.5718,
  longitude: -46.6298,
  latitudeDelta: 0.016,
  longitudeDelta: 0.016,
};

const MIN_DELTA = 0.008;
const BOUNDS_PADDING = 1.6;
const FOCUS_DELTA = 0.011;
const USER_DELTA = 0.008;
const PREVIEW_OFFSET_RATIO = 0.15;

export function getRegionForCoordinates(coordinates: Coordinates[]): Region {
  if (coordinates.length === 0) return DEFAULT_REGION;

  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeDelta = Math.max((maxLatitude - minLatitude) * BOUNDS_PADDING, MIN_DELTA);
  const longitudeDelta = Math.max((maxLongitude - minLongitude) * BOUNDS_PADDING, MIN_DELTA);

  return {
    latitude: (minLatitude + maxLatitude) / 2 - latitudeDelta * PREVIEW_OFFSET_RATIO,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta,
    longitudeDelta,
  };
}

export function getFocusRegion(coordinates: Coordinates): Region {
  return {
    latitude: coordinates.latitude - FOCUS_DELTA * PREVIEW_OFFSET_RATIO,
    longitude: coordinates.longitude,
    latitudeDelta: FOCUS_DELTA,
    longitudeDelta: FOCUS_DELTA,
  };
}

export function getUserRegion(coordinates: Coordinates): Region {
  return {
    latitude: coordinates.latitude - USER_DELTA * PREVIEW_OFFSET_RATIO,
    longitude: coordinates.longitude,
    latitudeDelta: USER_DELTA,
    longitudeDelta: USER_DELTA,
  };
}
