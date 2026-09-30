import type { LucideIcon } from 'lucide-react-native';
import { Zap } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { Ring, ringToneColors, type RingTone } from '@/components/ui/ring';
import { colors, fonts, motion, radii } from '@/constants/theme';

const toneBackgrounds: Record<RingTone, string> = {
  charging: colors.statusChargingBg,
  idle: colors.statusIdleBg,
  fault: colors.statusFaultBg,
  info: colors.statusInfoBg,
  accent: colors.accentQuiet,
};

function BoltPulse() {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.55, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return (
    <Animated.View style={style}>
      <Icon icon={Zap} size={13} color={colors.statusCharging} strokeWidth={2.6} />
    </Animated.View>
  );
}

export type SessionRingProps = {
  progress: number;
  tone: RingTone;
  value: string;
  unit?: string;
  label: string;
  pillLabel: string;
  pillIcon?: LucideIcon;
  mono?: boolean;
  glow?: boolean;
};

export function SessionRing({
  progress,
  tone,
  value,
  unit,
  label,
  pillLabel,
  pillIcon,
  mono = false,
  glow = false,
}: SessionRingProps) {
  const color = ringToneColors[tone];

  return (
    <Animated.View entering={FadeIn.duration(motion.duration.slow)} style={styles.wrap}>
      <Ring progress={progress} tone={tone} glow={glow}>
        <View style={styles.center}>
          <View style={styles.valueRow}>
            <Text style={[mono ? styles.clock : styles.value, { color }]}>{value}</Text>
            {unit ? <Text style={styles.unit}>{unit}</Text> : null}
          </View>
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.pill, { backgroundColor: toneBackgrounds[tone] }]}>
            {pillIcon ? <Icon icon={pillIcon} size={13} color={color} strokeWidth={2.4} /> : <BoltPulse />}
            <Text style={[styles.pillLabel, { color }]}>{pillLabel}</Text>
          </View>
        </View>
      </Ring>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  center: {
    alignItems: 'center',
    gap: 2,
    maxWidth: 180,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  value: {
    fontSize: 44,
    lineHeight: 48,
    fontFamily: fonts.bold,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  clock: {
    fontSize: 44,
    lineHeight: 48,
    fontFamily: fonts.mono,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textSubtle,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  pillLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
});
