import { useMemo } from 'react';

import { useChargePoints } from '@/features/charging/api/use-charge-points';
import { selectNearbyChargePoints } from '@/features/charging/charge-point-nearby';
import { useMapCenter } from '@/features/charging/map/use-map-center';

export function useNearbyChargePoints() {
  const query = useChargePoints();
  const center = useMapCenter({ enabled: true, chargePoints: query.data, isLoading: query.isPending });
  const nearby = useMemo(
    () => selectNearbyChargePoints(query.data ?? [], center.coordinates),
    [query.data, center.coordinates],
  );
  return { ...query, nearby };
}
