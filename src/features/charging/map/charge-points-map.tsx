import { useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { darkMapStyle } from '@/constants/map-style';
import { ChargePointMarker, UserLocationMarker } from '@/features/charging/map/charge-point-marker';
import type { ChargePointsMapProps } from '@/features/charging/map/map-types';

export const isMapSupported = true;

const ZOOM_DURATION = 240;
const FALLBACK_ZOOM = 15;

export function ChargePointsMap({
  ref,
  chargePoints,
  selectedId,
  myCharge,
  userCoordinates,
  userLabel,
  initialRegion,
  padding,
  onSelect,
}: ChargePointsMapProps) {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration) => mapRef.current?.animateToRegion(region, duration),
    zoomBy: (delta) => {
      const map = mapRef.current;
      if (!map) return;
      map
        .getCamera()
        .then((camera) =>
          map.animateCamera({ zoom: (camera.zoom ?? FALLBACK_ZOOM) + delta }, { duration: ZOOM_DURATION }),
        )
        .catch(() => undefined);
    },
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
      {chargePoints.map((chargePoint, index) => (
        <ChargePointMarker
          key={chargePoint.id}
          chargePoint={chargePoint}
          index={index}
          isSelected={chargePoint.id === selectedId}
          isMine={myCharge?.chargePointId === chargePoint.id}
          chargeLabel={myCharge?.label}
          onPress={() => onSelect(chargePoint)}
        />
      ))}
    </MapView>
  );
}
