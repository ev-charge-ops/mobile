import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors, motion } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type RingTone = 'charging' | 'idle' | 'fault' | 'info' | 'accent';

export const ringToneColors: Record<RingTone, string> = {
  charging: colors.energy,
  idle: colors.warning,
  fault: colors.critical,
  info: colors.info,
  accent: colors.accent,
};

export type RingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  tone?: RingTone;
  color?: string;
  glow?: boolean;
  glowColor?: string;
  accessibilityLabel?: string;
  testID?: string;
  children?: ReactNode;
};

export function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(1, progress));
}

export function Ring({
  progress,
  size = 236,
  strokeWidth = 12,
  tone = 'charging',
  color,
  glow = false,
  glowColor,
  accessibilityLabel,
  testID,
  children,
}: RingProps) {
  const strokeColor = color ?? ringToneColors[tone];
  const radius = (size - strokeWidth) / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const ratio = clampProgress(progress);

  const fill = useSharedValue(0);
  useEffect(() => {
    fill.set(withTiming(ratio, { duration: motion.duration.slow, easing: motion.easing.out }));
  }, [ratio, fill]);

  const dashProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - circumference * fill.get(),
  }));

  const pulse = useSharedValue(0);
  useEffect(() => {
    if (glow) {
      pulse.set(
        withRepeat(
          withSequence(
            withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
        ),
      );
    } else {
      pulse.set(withTiming(0, { duration: motion.duration.base }));
    }
  }, [glow, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.16 + pulse.get() * 0.24,
    transform: [{ scale: 1 + pulse.get() * 0.045 }],
  }));

  return (
    <View
      accessible={accessibilityLabel !== undefined}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      testID={testID}
      style={[styles.root, { width: size, height: size }]}
    >
      {glow ? (
        <Animated.View
          testID={testID ? `${testID}-glow` : undefined}
          style={[
            styles.glow,
            { width: size * 0.9, height: size * 0.9, borderRadius: size, backgroundColor: glowColor ?? strokeColor },
            glowStyle,
          ]}
        />
      ) : null}
      <Svg width={size} height={size} style={[styles.svg, { transform: [{ rotate: '-90deg' }] }]}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.meterTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          animatedProps={dashProps}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
