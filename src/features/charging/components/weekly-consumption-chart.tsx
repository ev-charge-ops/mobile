import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { Card } from '@/components/ui/card';
import { colors, fonts, motion, spacing } from '@/constants/theme';
import type { WeekBucket } from '@/features/charging/history-month';
import { formatEnergy } from '@/utils/format-energy';

const MAX_BAR_HEIGHT = 68;
const MIN_BAR_HEIGHT = 2;
const BAR_STAGGER_MS = 40;

export function getBarHeight(energyKwh: number, maxKwh: number) {
  if (energyKwh <= 0 || maxKwh <= 0) return MIN_BAR_HEIGHT;
  return Math.max(MIN_BAR_HEIGHT, Math.round((energyKwh / maxKwh) * MAX_BAR_HEIGHT));
}

export type WeeklyConsumptionChartProps = {
  weeks: WeekBucket[];
};

export function WeeklyConsumptionChart({ weeks }: WeeklyConsumptionChartProps) {
  const maxKwh = Math.max(0, ...weeks.map((week) => week.energyKwh));

  return (
    <Card>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={styles.title}>
          Consumo por semana
        </Text>
        <Text style={styles.unit}>kWh</Text>
      </View>
      <View style={styles.chart}>
        {weeks.map((week, index) => (
          <Bar
            key={week.label}
            label={week.label}
            energyKwh={week.energyKwh}
            height={getBarHeight(week.energyKwh, maxKwh)}
            index={index}
          />
        ))}
      </View>
    </Card>
  );
}

type BarProps = {
  label: string;
  energyKwh: number;
  height: number;
  index: number;
};

function Bar({ label, energyKwh, height, index }: BarProps) {
  const animatedHeight = useSharedValue(MIN_BAR_HEIGHT);
  const hasEnergy = energyKwh > 0;
  const value = hasEnergy ? formatEnergy(energyKwh, { withUnit: false, fractionDigits: 1 }) : '—';

  useEffect(() => {
    animatedHeight.set(
      withDelay(
        index * BAR_STAGGER_MS,
        withTiming(height, { duration: motion.duration.slow, easing: motion.easing.out }),
      ),
    );
  }, [animatedHeight, height, index]);

  const barStyle = useAnimatedStyle(() => ({ height: animatedHeight.get() }));

  return (
    <View
      accessible
      accessibilityLabel={hasEnergy ? `Semana ${index + 1}: ${value} kWh` : `Semana ${index + 1}: sem recargas`}
      testID={`week-bar-${label}`}
      style={styles.column}
    >
      <Text style={styles.value}>{value}</Text>
      <Animated.View style={[styles.bar, hasEnergy ? styles.barFilled : styles.barEmpty, barStyle]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  unit: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textSubtle,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    height: 108,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  value: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.textSubtle,
    fontVariant: ['tabular-nums'],
  },
  bar: {
    width: '100%',
    borderRadius: 6,
  },
  barFilled: {
    backgroundColor: colors.surfaceRaised,
  },
  barEmpty: {
    backgroundColor: colors.hairline,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    color: colors.textDisabled,
  },
});
