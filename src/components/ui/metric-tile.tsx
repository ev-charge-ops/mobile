import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export type MetricTileSize = 'sm' | 'md' | 'lg' | 'xl';
export type MetricTileTone = 'default' | 'charging' | 'demand' | 'fault';

export type MetricTileProps = {
  value: string;
  unit?: string;
  label?: string;
  size?: MetricTileSize;
  tone?: MetricTileTone;
  style?: StyleProp<ViewStyle>;
};

const sizes = {
  sm: { fontSize: 20, lineHeight: 24 },
  md: { fontSize: 20, lineHeight: 24 },
  lg: { fontSize: 26, lineHeight: 30 },
  xl: { fontSize: 38, lineHeight: 42 },
} as const;

const toneColors: Record<MetricTileTone, string> = {
  default: colors.textTitle,
  charging: colors.statusCharging,
  demand: colors.statusIdle,
  fault: colors.statusFault,
};

export function MetricTile({ value, unit, label, size = 'md', tone = 'default', style }: MetricTileProps) {
  return (
    <View style={style}>
      <View style={styles.pair}>
        <Text style={[styles.value, sizes[size], { color: toneColors[tone] }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  pair: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 2,
  },
});
