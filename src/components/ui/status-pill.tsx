import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { fonts, getColors, motion, radii, type ColorScheme, type ThemeColors } from '@/constants/theme';

export type Status = 'available' | 'charging' | 'idle' | 'fault' | 'info' | 'offline';
export type StatusPillSize = 'sm' | 'md';

export type StatusPillProps = {
  label: string;
  status?: Status;
  icon?: LucideIcon;
  live?: boolean;
  size?: StatusPillSize;
  scheme?: ColorScheme;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

type StatusStyle = {
  color: string;
  backgroundColor: string;
  dot: string | null;
};

export function getStatusStyle(tokens: ThemeColors, status: Status): StatusStyle {
  switch (status) {
    case 'available':
    case 'charging':
      return { color: tokens.statusCharging, backgroundColor: tokens.statusChargingBg, dot: tokens.energy };
    case 'idle':
      return { color: tokens.statusIdle, backgroundColor: tokens.statusIdleBg, dot: tokens.warning };
    case 'fault':
      return { color: tokens.statusFault, backgroundColor: tokens.statusFaultBg, dot: tokens.critical };
    case 'offline':
      return { color: tokens.statusOffline, backgroundColor: tokens.statusOfflineBg, dot: tokens.statusOfflineDot };
    default:
      return { color: tokens.statusInfo, backgroundColor: tokens.statusInfoBg, dot: null };
  }
}

const sizes = {
  sm: { fontSize: 13, paddingHorizontal: 10, paddingVertical: 5, dot: 7, gap: 6 },
  md: { fontSize: 14, paddingHorizontal: 12, paddingVertical: 7, dot: 8, gap: 8 },
} as const;

export function StatusPill({
  label,
  status = 'info',
  icon,
  live,
  size = 'sm',
  scheme = 'light',
  style,
  testID,
}: StatusPillProps) {
  const statusStyle = getStatusStyle(getColors(scheme), status);
  const sizeStyle = sizes[size];
  const isLive = live ?? status === 'charging';

  return (
    <View
      testID={testID}
      style={[
        styles.pill,
        {
          backgroundColor: statusStyle.backgroundColor,
          gap: sizeStyle.gap,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
        style,
      ]}
    >
      {icon ? (
        <Icon icon={icon} size={sizeStyle.fontSize} color={statusStyle.color} strokeWidth={2.4} />
      ) : statusStyle.dot ? (
        <StatusDot color={statusStyle.dot} size={sizeStyle.dot} live={isLive} />
      ) : null}
      <Text style={[styles.label, { fontSize: sizeStyle.fontSize, color: statusStyle.color }]}>{label}</Text>
    </View>
  );
}

export type StatusDotProps = {
  color: string;
  size?: number;
  live?: boolean;
};

export function StatusDot({ color, size = 8, live = false }: StatusDotProps) {
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  const animate = live && !reducedMotion;

  useEffect(() => {
    if (animate) {
      pulse.set(0);
      pulse.set(withRepeat(withTiming(1, { duration: motion.duration.live, easing: motion.easing.standard }), -1));
    } else {
      cancelAnimation(pulse);
      pulse.set(0);
    }
  }, [animate, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - pulse.get()),
    transform: [{ scale: 1 + pulse.get() * 2 }],
  }));

  const dotStyle = { width: size, height: size, borderRadius: size / 2, backgroundColor: color };

  return (
    <View testID={live ? 'status-dot-live' : 'status-dot'} style={dotStyle}>
      {animate ? <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, dotStyle, haloStyle]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
  },
  label: {
    fontFamily: fonts.bold,
  },
});
