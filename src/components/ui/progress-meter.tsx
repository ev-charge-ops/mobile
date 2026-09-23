import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, fonts, motion } from '@/constants/theme';

export type ProgressMeterTone = 'energy' | 'demand' | 'fault';

export type ProgressMeterProps = {
  value: number;
  max?: number;
  caption?: string;
  valueLabel?: string;
  tone?: ProgressMeterTone;
  segmented?: boolean | number;
  threshold?: number;
  testID?: string;
};

const toneColors: Record<ProgressMeterTone, string> = {
  energy: colors.meterEnergy,
  demand: colors.meterDemand,
  fault: colors.meterOver,
};

const defaultSegments = 10;

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
  testID,
}: ProgressMeterProps) {
  const ratio = getMeterRatio(value, max);
  const isOver = threshold !== undefined && value >= threshold;
  const fillColor = isOver ? colors.meterOver : toneColors[tone];
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
          <Text style={styles.caption}>{caption}</Text>
          <Text style={[styles.valueLabel, isOver && styles.valueLabelOver]}>{valueLabel}</Text>
        </View>
      ) : null}
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={caption}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
        style={styles.track}
      >
        <Animated.View testID="progress-meter-fill" style={[styles.fill, { backgroundColor: fillColor }, fillStyle]} />
        {segments > 1 ? (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.segments]}>
            {Array.from({ length: segments - 1 }, (_, index) => (
              <View key={index} testID="progress-meter-gap" style={styles.gap} />
            ))}
          </View>
        ) : null}
        {threshold !== undefined && max > 0 ? (
          <View
            pointerEvents="none"
            testID="progress-meter-threshold"
            style={[styles.threshold, { left: `${getMeterRatio(threshold, max) * 100}%` }]}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  caption: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
  },
  valueLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  valueLabelOver: {
    color: colors.meterOver,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.meterTrack,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  segments: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  gap: {
    width: 2,
    backgroundColor: colors.bgBase,
    opacity: 0.9,
  },
  threshold: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 2,
    marginLeft: -1,
    borderRadius: 1,
    backgroundColor: colors.textMuted,
  },
});
