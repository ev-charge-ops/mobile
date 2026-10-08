import type { ChargePoint } from '@/features/charging/api/charging-api';
import { rankChargePointsByDistance, type RankedChargePoint } from '@/features/charging/charge-point-distance';
import type { Coordinates } from '@/features/charging/map/map-region';

export const NEARBY_CHARGE_POINTS_LIMIT = 4;

export function selectNearbyChargePoints(
  chargePoints: ChargePoint[],
  reference: Coordinates | null,
  limit = NEARBY_CHARGE_POINTS_LIMIT,
): RankedChargePoint[] {
  const members = chargePoints.filter((chargePoint) => chargePoint.isMember);
  const pool = members.length > 0 ? members : chargePoints;
  return rankChargePointsByDistance(pool, reference).slice(0, limit);
}
