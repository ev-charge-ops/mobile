import type { ChargePoint } from '@/features/charging/api/charging-api';
import type { Coordinates } from '@/features/charging/map/map-region';

const EARTH_RADIUS_METERS = 6_371_000;

export type RankedChargePoint = {
  chargePoint: ChargePoint;
  distanceMeters: number | null;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function getDistanceMeters(from: Coordinates, to: Coordinates): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

export function formatDistance(meters: number): string {
  const roundedMeters = Math.max(10, Math.round(meters / 10) * 10);
  if (roundedMeters < 1000) return `${roundedMeters} m`;
  return `${(Math.round(meters / 100) / 10).toFixed(1).replace('.', ',')} km`;
}

export function rankChargePointsByDistance(
  chargePoints: ChargePoint[],
  reference: Coordinates | null,
): RankedChargePoint[] {
  if (!reference) return chargePoints.map((chargePoint) => ({ chargePoint, distanceMeters: null }));
  return chargePoints
    .map((chargePoint) => ({ chargePoint, distanceMeters: getDistanceMeters(reference, chargePoint) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
