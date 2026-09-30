import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { fonts, getColors, motion, radii, type ColorScheme, type ThemeColors } from '@/constants/theme';

export type ProgressMeterTone = 'energy' | 'demand' | 'fault';

export type ProgressMeterProps = {
  value: number;
  max?: number;
  caption?: string;
  valueLabel?: string;
  tone?: ProgressMeterTone;
  segmented?: boolean | number;
  threshold?: number;
  limit?: number;
  flow?: boolean;
  scheme?: ColorScheme;
  testID?: string;
};

const defaultSegments = 10;
const trackHeight = 8;
const flowPeriod = 40;
const flowStripes = 40;

function getToneColor(tokens: ThemeColors, tone: ProgressMeterTone) {
  if (tone === 'demand') return tokens.meterDemand;
  if (tone === 'fault') return tokens.meterOver;
  return tokens.meterEnergy;
}

export function getMeterRatio(value: number, max: number) {
  if (!(max > 0) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value / max));
}

export function ProgressMeter({
  value,
  max = 100,
  caption,
  valueLabel,
  tone = 'energy',
  segmented,
  threshold,
  limit,
  flow = false,
  scheme = 'light',
  testID,
}: ProgressMeterProps) {
  const tokens = getColors(scheme);
  const ratio = getMeterRatio(value, max);
  const isOver = threshold !== undefined && value >= threshold;
  const fillColor = isOver ? tokens.meterOver : getToneColor(tokens, tone);
  const segments = segmented === true ? defaultSegments : typeof segmented === 'number' ? segmented : 0;

  const width = useSharedValue(0);
  useEffect(() => {
    width.set(withTiming(ratio, { duration: motion.duration.slow, easing: motion.easing.out }));
  }, [ratio, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));

  return (
    <View testID={testID}>
      {caption || valueLabel ? (
        <View style={styles.header}>
          <Text style={[styles.caption, { color: tokens.textMuted }]}>{caption}</Text>
          <Text style={[styles.valueLabel, { color: isOver ? tokens.meterOver : tokens.textTitle }]}>{valueLabel}</Text>
        </View>
      ) : null}
      <View>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={caption}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
          style={[styles.track, { backgroundColor: tokens.meterTrack }]}
        >
          <Animated.View testID="progress-meter-fill" style={[styles.fill, { backgroundColor: fillColor }, fillStyle]}>
            {flow ? <FlowStripes color={tokens.meterFlow} /> : null}
          </Animated.View>
          {segments > 1 ? (
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.segments]}>
              {Array.from({ length: segments - 1 }, (_, index) => (
                <View
                  key={index}
                  testID="progress-meter-gap"
                  style={[styles.gap, { backgroundColor: tokens.surfaceCard }]}
                />
              ))}
            </View>
          ) : null}
        </View>
        {threshold !== undefined && max > 0 ? (
          <View
            pointerEvents="none"
            testID="progress-meter-threshold"
            style={[
              styles.threshold,
              { left: `${getMeterRatio(threshold, max) * 100}%`, backgroundColor: tokens.textMuted },
            ]}
          />
        ) : null}
        {limit !== undefined && max > 0 ? (
          <View
            pointerEvents="none"
            testID="progress-meter-limit"
            style={[styles.limit, { left: `${getMeterRatio(limit, max) * 100}%`, backgroundColor: tokens.meterLimit }]}
          />
        ) : null}
      </View>
    </View>
  );
}

function FlowStripes({ color }: { color: string }) {
  const reducedMotion = useReducedMotion();
  const offset = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    offset.set(0);
    offset.set(withRepeat(withTiming(flowPeriod, { duration: motion.duration.flow, easing: Easing.linear }), -1));
    return () => cancelAnimation(offset);
  }, [offset, reducedMotion]);

  const stripesStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));

  return (
    <Animated.View testID="progress-meter-flow" pointerEvents="none" style={[styles.flow, stripesStyle]}>
      {Array.from({ length: flowStripes }, (_, index) => (
        <View key={index} style={styles.flowCell}>
          <View style={[styles.flowStripe, { backgroundColor: color }]} />
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  valueLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: trackHeight,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  flow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -flowPeriod,
    flexDirection: 'row',
  },
  flowCell: {
    width: flowPeriod,
    height: '100%',
    paddingLeft: 20,
  },
  flowStripe: {
    width: 8,
    height: '100%',
  },
  segments: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  gap: {
    width: 3,
  },
  threshold: {
    position: 'absolute',
    top: -3,
    height: trackHeight + 6,
    width: 2,
    marginLeft: -1,
    borderRadius: 1,
  },
  limit: {
    position: 'absolute',
    top: -4,
    height: trackHeight + 8,
    width: 2,
    marginLeft: -1,
    borderRadius: 2,
  },
});
