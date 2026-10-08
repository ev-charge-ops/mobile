import { useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { clampProgress } from '@/components/ui/ring';
import { fonts, motion, nightColors, palette } from '@/constants/theme';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const RING_DRAW_DURATION = 1400;
const RING_DRAW_DELAY = 200;
const GLOW_HALF_CYCLE = 1500;
const LIMIT_LABEL_WIDTH = 84;
const LIMIT_LABEL_OFFSET = 24;

export function getRingPoint(ratio: number, radius: number, center: number) {
  const angle = clampProgress(ratio) * 2 * Math.PI - Math.PI / 2;
  return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
}

function getLabelPlacement(x: number, center: number) {
  if (x < center - 8) return { left: x - LIMIT_LABEL_WIDTH + 12, textAlign: 'right' as const };
  if (x > center + 8) return { left: x - 12, textAlign: 'left' as const };
  return { left: x - LIMIT_LABEL_WIDTH / 2, textAlign: 'center' as const };
}

export type ChargeRingProps = {
  progress: number;
  size?: number;
  radius?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  glow?: boolean;
  limit?: number | null;
  limitLabel?: string | null;
  accessibilityLabel?: string;
  testID?: string;
  children?: ReactNode;
};

export function ChargeRing({
  progress,
  size = 300,
  radius = 130,
  strokeWidth = 10,
  color = palette.green500,
  trackColor = '#1B1C1F',
  glow = false,
  limit = null,
  limitLabel = null,
  accessibilityLabel,
  testID,
  children,
}: ChargeRingProps) {
  const reduceMotion = useReduceMotion();
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = clampProgress(progress);
  const fill = useSharedValue(0);
  const breath = useSharedValue(0);
  const hasDrawn = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      fill.set(ratio);
      hasDrawn.current = true;
      return;
    }
    if (!hasDrawn.current) {
      hasDrawn.current = true;
      const draw = withTiming(ratio, { duration: RING_DRAW_DURATION, easing: motion.easing.out });
      fill.set(withDelay(RING_DRAW_DELAY, draw));
      return;
    }
    fill.set(withTiming(ratio, { duration: motion.duration.slow, easing: motion.easing.out }));
  }, [ratio, fill, reduceMotion]);

  useEffect(() => {
    if (!glow || reduceMotion) {
      cancelAnimation(breath);
      breath.set(0.5);
      return;
    }
    breath.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: GLOW_HALF_CYCLE, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: GLOW_HALF_CYCLE, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
  }, [glow, reduceMotion, breath]);

  const arcProps = useAnimatedProps(() => ({ strokeDashoffset: circumference * (1 - fill.get()) }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.35 + breath.get() * 0.35 }));
  const limitPoint = limit === null ? null : getRingPoint(limit, radius, center);
  const labelPoint = limit === null ? null : getRingPoint(limit, radius + LIMIT_LABEL_OFFSET, center);

  return (
    <View
      accessible={accessibilityLabel !== undefined}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      testID={testID}
      style={{ width: size, height: size }}
    >
      {glow ? (
        <Animated.View testID={testID ? `${testID}-glow` : undefined} style={[StyleSheet.absoluteFill, glowStyle]}>
          <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            {[30, 22, 14].map((width, index) => (
              <AnimatedCircle
                key={width}
                cx={center}
                cy={center}
                r={radius - 8}
                stroke={color}
                strokeOpacity={0.08 + index * 0.06}
                strokeWidth={width}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                animatedProps={arcProps}
              />
            ))}
          </Svg>
        </Animated.View>
      ) : null}
      <Svg width={size} height={size} style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
        <Circle cx={center} cy={center} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          animatedProps={arcProps}
        />
      </Svg>
      {limitPoint ? (
        <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Circle testID="ring-limit-dot" cx={limitPoint.x} cy={limitPoint.y} r={6} fill={palette.white} />
        </Svg>
      ) : null}
      {labelPoint && limitLabel ? (
        <Text
          numberOfLines={1}
          style={[
            styles.limitLabel,
            {
              ...getLabelPlacement(labelPoint.x, center),
              top: labelPoint.y - 8,
            },
          ]}
        >
          {limitLabel}
        </Text>
      ) : null}
      <View pointerEvents="box-none" style={styles.center}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitLabel: {
    position: 'absolute',
    width: LIMIT_LABEL_WIDTH,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.bold,
    color: nightColors.textMuted,
  },
});
