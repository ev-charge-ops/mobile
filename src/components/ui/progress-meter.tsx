import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export type ProgressMeterTone = 'energy' | 'demand' | 'fault';

export type ProgressMeterProps = {
  value: number;
  max?: number;
  caption?: string;
  valueLabel?: string;
  tone?: ProgressMeterTone;
};

const toneColors: Record<ProgressMeterTone, string> = {
  energy: colors.meterEnergy,
  demand: colors.meterDemand,
  fault: colors.meterOver,
};

export function ProgressMeter({ value, max = 100, caption, valueLabel, tone = 'energy' }: ProgressMeterProps) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;

  return (
    <View>
      {caption || valueLabel ? (
        <View style={styles.header}>
          <Text style={styles.caption}>{caption}</Text>
          <Text style={styles.valueLabel}>{valueLabel}</Text>
        </View>
      ) : null}
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={caption}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: toneColors[tone] }]} />
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
});
