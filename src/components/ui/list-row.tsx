import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, radii, spacing } from '@/constants/theme';

export type ListRowTone = 'neutral' | 'energy' | 'warning' | 'critical' | 'info';

export type ListRowProps = {
  label: string;
  hint?: string;
  value?: string;
  icon?: LucideIcon;
  tone?: ListRowTone;
  trailing?: ReactNode;
  divider?: boolean;
  onPress?: () => void;
  testID?: string;
};

const toneStyles: Record<ListRowTone, { backgroundColor: string; color: string }> = {
  neutral: { backgroundColor: colors.surfaceInset, color: colors.textTitle },
  energy: { backgroundColor: colors.energyTint, color: colors.energyText },
  warning: { backgroundColor: colors.warningTint, color: colors.warningText },
  critical: { backgroundColor: colors.criticalTint, color: colors.criticalText },
  info: { backgroundColor: colors.infoTint, color: colors.infoText },
};

export function ListRow({
  label,
  hint,
  value,
  icon,
  tone = 'neutral',
  trailing,
  divider = true,
  onPress,
  testID,
}: ListRowProps) {
  const toneStyle = toneStyles[tone];
  const content = (
    <View style={styles.row}>
      {icon ? (
        <View testID={testID ? `${testID}-icon` : undefined} style={[styles.iconTile, { backgroundColor: toneStyle.backgroundColor }]}>
          <Icon icon={icon} size={20} color={toneStyle.color} />
        </View>
      ) : null}
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {trailing}
      {onPress ? <Icon icon={ChevronRight} size={18} color={colors.textDisabled} /> : null}
    </View>
  );

  const body = (
    <>
      {content}
      {divider ? <View style={[styles.divider, icon && styles.dividerInset]} /> : null}
    </>
  );

  if (!onPress) return <View testID={testID}>{body}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 64,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.xl,
    backgroundColor: colors.hairline,
  },
  dividerInset: {
    marginLeft: spacing.xl + 44 + 14,
  },
  pressed: {
    backgroundColor: colors.surfaceInset,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radii.tile,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  hint: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
});
