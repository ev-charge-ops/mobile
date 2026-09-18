import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, radii, spacing } from '@/constants/theme';

export type ListRowProps = {
  label: string;
  hint?: string;
  value?: string;
  icon?: LucideIcon;
  trailing?: ReactNode;
  divider?: boolean;
  onPress?: () => void;
  testID?: string;
};

export function ListRow({ label, hint, value, icon, trailing, divider = true, onPress, testID }: ListRowProps) {
  const content = (
    <View style={[styles.row, divider && styles.divider]}>
      {icon ? (
        <View style={styles.iconTile}>
          <Icon icon={icon} size={18} color={colors.textSubtle} />
        </View>
      ) : null}
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {trailing}
      {onPress ? <Icon icon={ChevronRight} size={17} color={colors.textDisabled} /> : null}
    </View>
  );

  if (!onPress) return <View testID={testID}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: colors.hairline,
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconTile: {
    width: 34,
    height: 34,
    borderRadius: radii.input,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
  },
  texts: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 14.5,
    fontFamily: fonts.semibold,
    color: colors.textTitle,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 2,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
});
