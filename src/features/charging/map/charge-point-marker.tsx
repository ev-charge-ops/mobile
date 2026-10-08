import { Clock, Plug, Zap, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { fonts, motion, nightColors, palette } from '@/constants/theme';
import type { ChargePoint } from '@/features/charging/api/charging-api';

export type PinKind = 'free' | 'peak' | 'busy' | 'offline' | 'mine';

type PinStyle = {
  core: string;
  halo: string;
  ink: string;
  icon: LucideIcon;
};

export const pinStyles: Record<PinKind, PinStyle> = {
  free: { core: palette.green500, halo: 'rgba(61,220,132,0.22)', ink: palette.green950, icon: Zap },
  peak: { core: palette.amber500, halo: 'rgba(242,169,59,0.22)', ink: palette.amber950, icon: Zap },
  busy: { core: palette.amber500, halo: 'rgba(242,169,59,0.22)', ink: palette.amber950, icon: Clock },
  offline: { core: palette.night600, halo: 'rgba(164,169,177,0.18)', ink: palette.night200, icon: Plug },
  mine: { core: palette.white, halo: 'rgba(255,255,255,0.14)', ink: palette.ink, icon: Zap },
};

export function getPinKind(chargePoint: ChargePoint, isMine: boolean): PinKind {
  if (isMine) return 'mine';
  if (chargePoint.status === 'OFFLINE') return 'offline';
  if (chargePoint.status !== 'AVAILABLE') return 'busy';
  return chargePoint.pricing?.demandLevel === 'PEAK' ? 'peak' : 'free';
}

const CORE_SIZE = 36;
const HALO_SIZE = 52;
const CANVAS_SIZE = 92;
const DROP_DURATION = 500;
const HALO_DURATION = 1800;
const SNAPSHOT_SLACK = 120;

export type ChargePointMarkerProps = {
  chargePoint: ChargePoint;
  index: number;
  isSelected: boolean;
  isMine?: boolean;
  chargeLabel?: string | null;
  onPress: () => void;
};

export function ChargePointMarker({
  chargePoint,
  index,
  isSelected,
  isMine = false,
  chargeLabel = null,
  onPress,
}: ChargePointMarkerProps) {
  const kind = getPinKind(chargePoint, isMine);
  const reduceMotion = useReducedMotion();
  const pulses = kind === 'free' && !reduceMotion;
  const delay = index * motion.revealStagger;
  const viewKey = `${kind}|${isSelected}|${chargeLabel ?? ''}`;
  const [snapshotKey, setSnapshotKey] = useState<string | null>(null);
  const tracksViewChanges = pulses || snapshotKey !== viewKey;

  useEffect(() => {
    if (pulses || snapshotKey === viewKey) return;
    const timeout = setTimeout(() => setSnapshotKey(viewKey), delay + DROP_DURATION + SNAPSHOT_SLACK);
    return () => clearTimeout(timeout);
  }, [pulses, snapshotKey, viewKey, delay]);

  return (
    <Marker
      testID={`marker-${chargePoint.id}`}
      coordinate={{ latitude: chargePoint.latitude, longitude: chargePoint.longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
      zIndex={isSelected ? 3 : isMine ? 2 : 1}
    >
      <ChargePin
        kind={kind}
        label={isMine ? chargeLabel : null}
        isSelected={isSelected}
        delay={delay}
        pulses={pulses}
      />
    </Marker>
  );
}

export type ChargePinProps = {
  kind: PinKind;
  label?: string | null;
  isSelected?: boolean;
  delay?: number;
  pulses?: boolean;
};

export function ChargePin({ kind, label = null, isSelected = false, delay = 0, pulses = false }: ChargePinProps) {
  const pin = pinStyles[kind];
  const reduceMotion = useReducedMotion();
  const drop = useSharedValue(reduceMotion ? 1 : 0);
  const halo = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    drop.set(withDelay(delay, withTiming(1, { duration: DROP_DURATION, easing: motion.easing.out })));
  }, [delay, drop, reduceMotion]);

  useEffect(() => {
    if (!pulses) {
      cancelAnimation(halo);
      halo.set(0);
      return;
    }
    halo.set(withRepeat(withTiming(1, { duration: HALO_DURATION, easing: motion.easing.standard }), -1));
  }, [pulses, halo]);

  const dropStyle = useAnimatedStyle(() => ({
    opacity: drop.get(),
    transform: [{ translateY: (1 - drop.get()) * -14 }, { scale: 0.8 + drop.get() * 0.2 }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.8 * (1 - halo.get()),
    transform: [{ scale: 0.7 + halo.get() * 1.3 }],
  }));

  return (
    <Animated.View testID={`pin-${kind}`} style={[styles.canvas, dropStyle]}>
      {pulses ? <Animated.View testID="pin-pulse" style={[styles.pulse, pulseStyle]} /> : null}
      <View style={[styles.halo, { backgroundColor: pin.halo }]} />
      <View
        style={[
          styles.core,
          { backgroundColor: pin.core },
          isSelected && { borderWidth: 3, borderColor: kind === 'mine' ? palette.green500 : palette.white },
        ]}
      >
        {label ? (
          <Text style={[styles.label, { color: pin.ink }]}>{label}</Text>
        ) : (
          <Icon icon={pin.icon} size={18} color={pin.ink} strokeWidth={2.4} />
        )}
      </View>
    </Animated.View>
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
    const timeout = setTimeout(() => setTracksViewChanges(false), DROP_DURATION);
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
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(61,220,132,0.35)',
  },
  halo: {
    position: 'absolute',
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: HALO_SIZE / 2,
  },
  core: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.extrabold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  userWrap: {
    alignItems: 'center',
    gap: 2,
  },
  userLabel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
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
    backgroundColor: 'rgba(59,130,246,0.2)',
  },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.blue500,
    borderWidth: 3,
    borderColor: palette.white,
  },
});
