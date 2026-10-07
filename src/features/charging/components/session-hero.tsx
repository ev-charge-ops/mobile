import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, radii, spacing } from '@/constants/theme';

export type SessionHeroProps = {
  value: string;
  unit?: string;
  label: string;
  pillLabel: string;
  pillIcon: LucideIcon;
  color: string;
  backgroundColor: string;
};

export function SessionHero({ value, unit, label, pillLabel, pillIcon, color, backgroundColor }: SessionHeroProps) {
  return (
    <View style={[styles.hero, { borderColor: backgroundColor }]}>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.pill, { backgroundColor }]}>
        <Icon icon={pillIcon} size={13} color={color} strokeWidth={2.4} />
        <Text style={[styles.pillLabel, { color }]}>{pillLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxl,
    borderRadius: radii.card,
    borderWidth: 1,
    backgroundColor: colors.surfaceCard,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  value: {
    fontSize: 48,
    lineHeight: 54,
    fontFamily: fonts.extrabold,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  pillLabel: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
});
