import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale, type HapticFeedback } from '@/components/ui/pressable-scale';
import { fonts, getColors, radii, type ColorScheme, type ThemeColors } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  scheme?: ColorScheme;
  icon?: LucideIcon;
  trailingIcon?: LucideIcon;
  trailingIconColor?: string;
  leadingIcon?: ReactNode;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  haptic?: boolean | HapticFeedback;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const sizes = {
  sm: { height: 36, fontSize: 14, iconSize: 16, paddingHorizontal: 14 },
  md: { height: 48, fontSize: 15, iconSize: 18, paddingHorizontal: 20 },
  lg: { height: 56, fontSize: 17, iconSize: 20, paddingHorizontal: 24 },
  xl: { height: 60, fontSize: 17, iconSize: 20, paddingHorizontal: 24 },
} as const;

function getTextColor(tokens: ThemeColors, variant: ButtonVariant, disabled: boolean) {
  if (disabled) return tokens.textDisabled;
  switch (variant) {
    case 'primary':
      return tokens.textOnAccent;
    case 'danger':
      return tokens.criticalText;
    case 'ghost':
      return tokens.textMuted;
    default:
      return tokens.textTitle;
  }
}

function getContainerStyle(tokens: ThemeColors, variant: ButtonVariant, disabled: boolean): ViewStyle {
  switch (variant) {
    case 'primary':
      return { backgroundColor: disabled ? tokens.surfaceRaised : tokens.accent };
    case 'secondary':
      return { backgroundColor: tokens.surfaceInset };
    case 'outline':
      return { borderWidth: 1.5, borderColor: disabled ? tokens.hairline : tokens.borderSubtle };
    case 'danger':
      return { borderWidth: 1.5, borderColor: disabled ? tokens.hairline : tokens.critical };
    default:
      return {};
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  scheme = 'light',
  icon,
  trailingIcon,
  trailingIconColor,
  leadingIcon,
  block = false,
  disabled = false,
  loading = false,
  haptic,
  style,
  testID,
}: ButtonProps) {
  const tokens = getColors(scheme);
  const sizeStyle = sizes[size];
  const isDisabled = disabled || loading;
  const textColor = getTextColor(tokens, variant, isDisabled);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      haptic={haptic}
      disabled={isDisabled}
      testID={testID}
      style={[styles.base, getContainerStyle(tokens, variant, isDisabled), block && styles.block, style]}
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
        {trailingIcon && !loading ? (
          <Icon
            icon={trailingIcon}
            size={sizeStyle.iconSize}
            color={isDisabled ? textColor : (trailingIconColor ?? textColor)}
          />
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    borderCurve: 'continuous',
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
    gap: 10,
  },
  label: {
    fontFamily: fonts.bold,
  },
});
