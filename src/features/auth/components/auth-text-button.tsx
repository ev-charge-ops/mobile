import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, radii } from '@/constants/theme';

export type AuthTextButtonProps = {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  accessibilityLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  tone?: 'default' | 'muted';
  style?: StyleProp<ViewStyle>;
};

export function AuthTextButton({
  label,
  onPress,
  icon,
  accessibilityLabel,
  disabled = false,
  loading = false,
  tone = 'default',
  style,
}: AuthTextButtonProps) {
  const isDisabled = disabled || loading;
  const color = isDisabled ? colors.textDisabled : tone === 'muted' ? colors.textMuted : colors.textTitle;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      haptic="selection"
      onPress={onPress}
      style={[styles.button, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : icon ? (
        <Icon icon={icon} size={18} color={color} />
      ) : null}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.bold,
  },
});
