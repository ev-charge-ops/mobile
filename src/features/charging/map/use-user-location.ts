import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Coordinates } from '@/features/charging/map/map-region';

export type UserLocationStatus = 'idle' | 'pending' | 'granted' | 'denied' | 'unavailable';

export type UserLocation = {
  status: UserLocationStatus;
  coordinates: Coordinates | null;
  request: () => Promise<Coordinates | null>;
};

function toCoordinates(position: Location.LocationObject | null): Coordinates | null {
  if (!position) return null;
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

export function useUserLocation(enabled: boolean): UserLocation {
  const [status, setStatus] = useState<UserLocationStatus>('idle');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const hasStarted = useRef(false);

  const locate = useCallback(async () => {
    let lastKnown: Coordinates | null = null;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setStatus('denied');
        return null;
      }
      lastKnown = toCoordinates(await Location.getLastKnownPositionAsync());
      if (lastKnown) {
        setCoordinates(lastKnown);
        setStatus('granted');
      }
      const current = toCoordinates(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      const resolved = current ?? lastKnown;
      setCoordinates(resolved);
      setStatus(resolved ? 'granted' : 'unavailable');
      return resolved;
    } catch {
      setStatus(lastKnown ? 'granted' : 'unavailable');
      return lastKnown;
    }
  }, []);

  const request = useCallback(() => {
    hasStarted.current = true;
    setStatus('pending');
    return locate();
  }, [locate]);

  useEffect(() => {
    if (!enabled || hasStarted.current) return;
    hasStarted.current = true;
    locate();
  }, [enabled, locate]);

  return { status: enabled && status === 'idle' ? 'pending' : status, coordinates, request };
}
