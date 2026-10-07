import { useCallback, useMemo } from 'react';
import type { Region } from 'react-native-maps';

import { demoMapCenterFallback, mapCenterSource, type MapCenterSource } from '@/config/map-center';
import type { ChargePoint } from '@/features/charging/api/charging-api';
import { getDemoMapCenter } from '@/features/charging/map/demo-map-center';
import { getAreaRegion, getUserRegion, type Coordinates } from '@/features/charging/map/map-region';
import { useUserLocation, type UserLocationStatus } from '@/features/charging/map/use-user-location';

export type MapCenter = {
  source: MapCenterSource;
  status: UserLocationStatus;
  coordinates: Coordinates | null;
  request: () => Promise<Coordinates | null>;
  regionFor: (coordinates: Coordinates) => Region;
};

export type UseMapCenterOptions = {
  enabled: boolean;
  chargePoints: ChargePoint[] | undefined;
  isLoading: boolean;
  source?: MapCenterSource;
};

export function useMapCenter({
  enabled,
  chargePoints,
  isLoading,
  source = mapCenterSource,
}: UseMapCenterOptions): MapCenter {
  const device = useUserLocation(enabled && source === 'device');

  const demoCoordinates = useMemo(
    () => (isLoading ? null : getDemoMapCenter(chargePoints ?? [], demoMapCenterFallback)),
    [chargePoints, isLoading],
  );

  const requestDemo = useCallback(
    async () => demoCoordinates ?? getDemoMapCenter(chargePoints ?? [], demoMapCenterFallback),
    [chargePoints, demoCoordinates],
  );

  return useMemo<MapCenter>(() => {
    if (source === 'device') {
      return {
        source,
        status: device.status,
        coordinates: device.coordinates,
        request: device.request,
        regionFor: getUserRegion,
      };
    }
    return {
      source,
      status: demoCoordinates ? 'granted' : 'pending',
      coordinates: demoCoordinates,
      request: requestDemo,
      regionFor: getAreaRegion,
    };
  }, [source, device.status, device.coordinates, device.request, demoCoordinates, requestDemo]);
}
