import type { Ref } from 'react';
import type { EdgePadding, Region } from 'react-native-maps';

import type { ChargePointSummary } from '@/features/charging/charge-point-summary';
import type { Coordinates } from '@/features/charging/map/map-region';
import type { MapCluster } from '@/features/charging/map/marker-clusters';

export type ChargePointsMapHandle = {
  animateToRegion: (region: Region, duration?: number) => void;
  zoomBy: (delta: number) => void;
};

export type MyCharge = {
  chargePointId: string;
  label: string | null;
};

export type ChargePointsMapProps = {
  ref?: Ref<ChargePointsMapHandle>;
  chargePoints: ChargePointSummary[];
  clusters?: MapCluster[];
  selectedId: string | null;
  myCharge?: MyCharge | null;
  userCoordinates: Coordinates | null;
  userLabel?: string | null;
  initialRegion: Region;
  padding: EdgePadding;
  onSelect: (chargePoint: ChargePointSummary) => void;
  onClusterPress?: (cluster: MapCluster) => void;
  onRegionChange?: (region: Region) => void;
};
