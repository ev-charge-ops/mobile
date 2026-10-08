import { useQuery } from '@tanstack/react-query';

import { listChargePointsInBounds, type ChargePointMapItem } from '@/features/charging/api/charging-api';
import { getDistanceMeters } from '@/features/charging/charge-point-distance';
import { getBoundsAround, toBbox } from '@/features/charging/map/map-bounds';
import type { Coordinates } from '@/features/charging/map/map-region';

export const NEARBY_RADIUS_METERS = 50_000;
export const NATIONWIDE_RADIUS_METERS = 4_000_000;

const NEARBY_STALE_TIME = 5 * 60_000;
const COORDINATE_PRECISION = 2;

export async function findNearestChargePoint(
  center: Coordinates,
  radiusMeters: number,
): Promise<ChargePointMapItem | null> {
  const [nearest] = await listChargePointsInBounds(toBbox(getBoundsAround(center, radiusMeters)), 1);
  if (!nearest) return null;
  return getDistanceMeters(center, nearest) <= radiusMeters ? nearest : null;
}

export function useHasChargePointNearby(center: Coordinates | null) {
  return useQuery({
    queryKey: [
      'charge-points',
      'nearby',
      center?.latitude.toFixed(COORDINATE_PRECISION),
      center?.longitude.toFixed(COORDINATE_PRECISION),
    ],
    queryFn: async () => (await findNearestChargePoint(center!, NEARBY_RADIUS_METERS)) !== null,
    enabled: center !== null,
    staleTime: NEARBY_STALE_TIME,
  });
}
