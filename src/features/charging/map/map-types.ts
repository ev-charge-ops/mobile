import type { Ref } from 'react';
import type { EdgePadding, Region } from 'react-native-maps';

import type { ChargePoint } from '@/features/charging/api/charging-api';
import type { Coordinates } from '@/features/charging/map/map-region';

export type ChargePointsMapHandle = {
  animateToRegion: (region: Region, duration?: number) => void;
};

export type ChargePointsMapProps = {
  ref?: Ref<ChargePointsMapHandle>;
  chargePoints: ChargePoint[];
  selectedId: string | null;
  userCoordinates: Coordinates | null;
  userLabel?: string | null;
  initialRegion: Region;
  padding: EdgePadding;
  onSelect: (chargePoint: ChargePoint) => void;
};
