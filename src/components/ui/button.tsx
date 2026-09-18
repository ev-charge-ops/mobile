import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, radii } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  leadingIcon?: ReactNode;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const sizes = {
  sm: { height: 36, fontSize: 13, iconSize: 15, paddingHorizontal: 12 },
  md: { height: 44, fontSize: 15, iconSize: 17, paddingHorizontal: 16 },
  lg: { height: 52, fontSize: 16, iconSize: 19, paddingHorizontal: 20 },
} as const;

const filledVariants: readonly ButtonVariant[] = ['primary', 'secondary', 'danger'];

function getTextColor(variant: ButtonVariant, disabled: boolean) {
  if (disabled) return filledVariants.includes(variant) ? colors.textSubtle : colors.textDisabled;
  if (variant === 'primary' || variant === 'danger') return colors.textOnAccent;
  if (variant === 'ghost') return colors.textSubtle;
  return colors.textTitle;
}

function getContainerStyle(variant: ButtonVariant, disabled: boolean): ViewStyle {
  if (disabled) {
    if (filledVariants.includes(variant)) return { backgroundColor: colors.surfaceInset };
    if (variant === 'outline') return { borderWidth: 1, borderColor: colors.hairline };
    return {};
  }
  switch (variant) {
    case 'primary':
    case 'danger':
      return { backgroundColor: colors.accent };
    case 'secondary':
      return { backgroundColor: colors.surfaceInset };
    case 'outline':
      return { borderWidth: 1, borderColor: colors.borderSubtle };
    default:
      return {};
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  leadingIcon,
  block = false,
  disabled = false,
  loading = false,
  style,
  testID,
}: ButtonProps) {
  const sizeStyle = sizes[size];
  const isDisabled = disabled || loading;
  const textColor = getTextColor(variant, isDisabled);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={[styles.base, getContainerStyle(variant, isDisabled), block && styles.block, style]}
    >
      <View style={[styles.content, { height: sizeStyle.height, paddingHorizontal: sizeStyle.paddingHorizontal }]}>
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : icon ? (
          <Icon icon={icon} size={sizeStyle.iconSize} color={textColor} />
        ) : (
          leadingIcon
        )}
        <Text style={[styles.label, { fontSize: sizeStyle.fontSize, color: textColor }]}>{label}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.card,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  block: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.bold,
  },
});
