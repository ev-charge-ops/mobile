import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { fonts, getColors, radii, type ColorScheme, type ThemeColors } from '@/constants/theme';

export type MetricTileSize = 'sm' | 'md' | 'lg' | 'xl';
export type MetricTileTone = 'default' | 'charging' | 'demand' | 'fault';

export type MetricTileProps = {
  value: string;
  unit?: string;
  label?: string;
  icon?: LucideIcon;
  size?: MetricTileSize;
  tone?: MetricTileTone;
  scheme?: ColorScheme;
  plain?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const sizes = {
  sm: { fontSize: 18, lineHeight: 22, letterSpacing: -0.3, unitSize: 12, padding: 12 },
  md: { fontSize: 20, lineHeight: 24, letterSpacing: -0.4, unitSize: 12, padding: 12 },
  lg: { fontSize: 30, lineHeight: 34, letterSpacing: -0.9, unitSize: 14, padding: 16 },
  xl: { fontSize: 40, lineHeight: 44, letterSpacing: -1.6, unitSize: 16, padding: 20 },
} as const;

const leadingUnits = new Set(['R$']);

function getToneColor(tokens: ThemeColors, tone: MetricTileTone) {
  switch (tone) {
    case 'charging':
      return tokens.energyText;
    case 'demand':
      return tokens.warningText;
    case 'fault':
      return tokens.criticalText;
    default:
      return tokens.textTitle;
  }
}

export function MetricTile({
  value,
  unit,
  label,
  icon,
  size = 'md',
  tone = 'default',
  scheme = 'light',
  plain = false,
  style,
  testID,
}: MetricTileProps) {
  const tokens = getColors(scheme);
  const sizeStyle = sizes[size];
  const unitBefore = unit !== undefined && leadingUnits.has(unit);
  const unitNode = unit ? (
    <Text style={[styles.unit, { fontSize: sizeStyle.unitSize, color: tokens.textMuted }]}>{unit}</Text>
  ) : null;

  return (
    <View
      testID={testID}
      style={[
        styles.tile,
        !plain && { backgroundColor: tokens.surfaceInset, padding: sizeStyle.padding },
        style,
      ]}
    >
      {label || icon ? (
        <View style={styles.header}>
          {label ? (
            <Text numberOfLines={1} style={[styles.label, { color: tokens.textMuted }]}>
              {label}
            </Text>
          ) : null}
          {icon ? <Icon icon={icon} size={18} color={tokens.textTitle} /> : null}
        </View>
      ) : null}
      <View style={styles.pair}>
        {unitBefore ? unitNode : null}
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.value,
            {
              fontSize: sizeStyle.fontSize,
              lineHeight: sizeStyle.lineHeight,
              letterSpacing: sizeStyle.letterSpacing,
              color: getToneColor(tokens, tone),
            },
          ]}
        >
          {value}
        </Text>
        {unitBefore ? null : unitNode}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    gap: 6,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.semibold,
  },
  pair: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  value: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontFamily: fonts.bold,
  },
});
