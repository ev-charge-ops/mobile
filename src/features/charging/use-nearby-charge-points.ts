import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';

import { useChargePoints } from '@/features/charging/api/use-charge-points';
import { selectNearbyChargePoints } from '@/features/charging/charge-point-nearby';
import type { Coordinates } from '@/features/charging/map/map-region';

async function readGrantedLocation(): Promise<Coordinates | null> {
  const permission = await Location.getForegroundPermissionsAsync();
  if (!permission.granted) return null;
  const position =
    (await Location.getLastKnownPositionAsync()) ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  return position ? { latitude: position.coords.latitude, longitude: position.coords.longitude } : null;
}

export function useGrantedLocation() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  useEffect(() => {
    let active = true;
    readGrantedLocation()
      .then((value) => {
        if (active && value) setCoordinates(value);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return coordinates;
}

export function useNearbyChargePoints() {
  const query = useChargePoints();
  const reference = useGrantedLocation();
  const nearby = useMemo(() => selectNearbyChargePoints(query.data ?? [], reference), [query.data, reference]);
  return { ...query, nearby };
}
