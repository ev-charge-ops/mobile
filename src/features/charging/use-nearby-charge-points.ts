import { useMemo } from 'react';

import type { MapCenterSource } from '@/config/map-center';
import { useChargePoints } from '@/features/charging/api/use-charge-points';
import { selectNearbyChargePoints } from '@/features/charging/charge-point-nearby';
import { useMapCenter } from '@/features/charging/map/use-map-center';

export function useNearbyChargePoints(source?: MapCenterSource) {
  const query = useChargePoints();
  const center = useMapCenter({ enabled: true, chargePoints: query.data, isLoading: query.isPending, source });
  const nearby = useMemo(
    () => selectNearbyChargePoints(query.data ?? [], center.coordinates),
    [query.data, center.coordinates],
  );
  return { ...query, nearby };
}
