import { Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { Icon } from '@/components/ui/icon';
import { fonts, nightColors, palette, radii } from '@/constants/theme';
import type { ChargePoint } from '@/features/charging/api/charging-api';
import { formatCents } from '@/features/charging/charging-format';

const markerColors: Record<ChargePoint['status'], string> = {
  AVAILABLE: nightColors.energy,
  CHARGING: nightColors.warning,
  IDLE: nightColors.warning,
  OFFLINE: nightColors.statusOfflineDot,
};

const SNAPSHOT_DURATION = 500;

export function formatMarkerPrice(chargePoint: ChargePoint) {
  return chargePoint.pricing ? formatCents(chargePoint.pricing.pricePerKwhCents) : 'Sem tarifa';
}

export type ChargePointMarkerProps = {
  chargePoint: ChargePoint;
  isSelected: boolean;
  onPress: () => void;
};

export function ChargePointMarker({ chargePoint, isSelected, onPress }: ChargePointMarkerProps) {
  const color = markerColors[chargePoint.status];
  const price = formatMarkerPrice(chargePoint);
  const viewKey = `${isSelected}|${price}|${color}`;
  const [snapshotKey, setSnapshotKey] = useState<string | null>(null);
  const tracksViewChanges = snapshotKey !== viewKey;

  useEffect(() => {
    if (!tracksViewChanges) return;
    const timeout = setTimeout(() => setSnapshotKey(viewKey), SNAPSHOT_DURATION);
    return () => clearTimeout(timeout);
  }, [tracksViewChanges, viewKey]);

  return (
    <Marker
      testID={`marker-${chargePoint.id}`}
      coordinate={{ latitude: chargePoint.latitude, longitude: chargePoint.longitude }}
      anchor={{ x: 0.5, y: 1 }}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
      zIndex={isSelected ? 2 : 1}
    >
      <View style={[styles.wrap, isSelected && styles.wrapSelected]}>
        {isSelected ? (
          <View style={[styles.bubble, styles.bubbleSelected]}>
            <Icon icon={Zap} size={13} color={nightColors.textOnInverse} strokeWidth={2.6} />
            <Text style={[styles.price, styles.priceSelected]}>{price}</Text>
          </View>
        ) : (
          <View style={styles.bubble}>
            <Icon icon={Zap} size={13} color={color} strokeWidth={2.6} />
            <Text style={styles.price}>{price}</Text>
          </View>
        )}
        <View style={[styles.tip, { backgroundColor: isSelected ? nightColors.surfaceInverse : color }]} />
      </View>
    </Marker>
  );
}

export type UserLocationMarkerProps = {
  latitude: number;
  longitude: number;
  label?: string | null;
};

export function UserLocationMarker({ latitude, longitude, label }: UserLocationMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(Boolean(label));

  useEffect(() => {
    if (!tracksViewChanges) return;
    const timeout = setTimeout(() => setTracksViewChanges(false), SNAPSHOT_DURATION);
    return () => clearTimeout(timeout);
  }, [tracksViewChanges]);

  const dot = (
    <View style={styles.userHalo}>
      <View style={styles.userDot} />
    </View>
  );

  return (
    <Marker
      testID="user-location-marker"
      coordinate={{ latitude, longitude }}
      anchor={label ? { x: 0.5, y: 0.75 } : { x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      zIndex={0}
    >
      {label ? (
        <View style={styles.userWrap}>
          <View style={styles.userLabel}>
            <Text style={styles.userLabelText}>{label}</Text>
          </View>
          {dot}
        </View>
      ) : (
        dot
      )}
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 4,
    padding: 6,
    paddingBottom: 4,
  },
  wrapSelected: {
    transform: [{ scale: 1.08 }],
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: nightColors.borderSubtle,
    backgroundColor: nightColors.surfaceCard,
    shadowColor: palette.black,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  bubbleSelected: {
    borderWidth: 0,
    backgroundColor: nightColors.surfaceInverse,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  price: {
    fontSize: 12,
    fontFamily: fonts.extrabold,
    color: nightColors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  priceSelected: {
    color: nightColors.textOnInverse,
  },
  tip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: palette.black,
    shadowOpacity: 0.45,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  userWrap: {
    alignItems: 'center',
    gap: 2,
  },
  userLabel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: nightColors.info,
  },
  userLabelText: {
    fontSize: 11,
    fontFamily: fonts.extrabold,
    color: palette.white,
  },
  userHalo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: nightColors.infoTint,
  },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: nightColors.info,
    borderWidth: 3,
    borderColor: palette.white,
  },
});
