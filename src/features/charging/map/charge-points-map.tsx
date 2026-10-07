import { useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { darkMapStyle } from '@/constants/map-style';
import { ChargePointMarker, UserLocationMarker } from '@/features/charging/map/charge-point-marker';
import type { ChargePointsMapProps } from '@/features/charging/map/map-types';

export const isMapSupported = true;

export function ChargePointsMap({
  ref,
  chargePoints,
  selectedId,
  userCoordinates,
  userLabel,
  initialRegion,
  padding,
  onSelect,
}: ChargePointsMapProps) {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration) => mapRef.current?.animateToRegion(region, duration),
  }));

  return (
    <MapView
      ref={mapRef}
      testID="charge-points-map"
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      customMapStyle={darkMapStyle}
      userInterfaceStyle="dark"
      initialRegion={initialRegion}
      mapPadding={padding}
      showsPointsOfInterests={false}
      showsCompass={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}
    >
      {userCoordinates ? <UserLocationMarker {...userCoordinates} label={userLabel} /> : null}
      {chargePoints.map((chargePoint) => (
        <ChargePointMarker
          key={chargePoint.id}
          chargePoint={chargePoint}
          isSelected={chargePoint.id === selectedId}
          onPress={() => onSelect(chargePoint)}
        />
      ))}
    </MapView>
  );
}
