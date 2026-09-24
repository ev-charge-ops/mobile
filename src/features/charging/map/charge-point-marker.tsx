import { LinearGradient } from 'expo-linear-gradient';
import { Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, palette, radii } from '@/constants/theme';
import type { ChargePoint } from '@/features/charging/api/charging-api';
import { formatCents } from '@/features/charging/charging-format';

const markerColors: Record<ChargePoint['status'], string> = {
  AVAILABLE: colors.statusCharging,
  CHARGING: colors.statusIdle,
  IDLE: colors.statusIdle,
  OFFLINE: colors.statusOffline,
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
          <LinearGradient
            colors={[palette.red400, palette.red600]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleSelected]}
          >
            <Icon icon={Zap} size={13} color={colors.textOnAccent} strokeWidth={2.6} />
            <Text style={[styles.price, styles.priceSelected]}>{price}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.bubble}>
            <Icon icon={Zap} size={13} color={color} strokeWidth={2.6} />
            <Text style={styles.price}>{price}</Text>
          </View>
        )}
        <View style={[styles.tip, { backgroundColor: isSelected ? colors.accent : color }]} />
      </View>
    </Marker>
  );
}

export type UserLocationMarkerProps = {
  latitude: number;
  longitude: number;
};

export function UserLocationMarker({ latitude, longitude }: UserLocationMarkerProps) {
  return (
    <Marker
      testID="user-location-marker"
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
      zIndex={0}
    >
      <View style={styles.userHalo}>
        <View style={styles.userDot} />
      </View>
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
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  bubbleSelected: {
    borderWidth: 0,
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  price: {
    fontSize: 12,
    fontFamily: fonts.extrabold,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  priceSelected: {
    color: colors.textOnAccent,
  },
  tip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  userHalo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.statusInfoBg,
  },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.statusInfo,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
});
