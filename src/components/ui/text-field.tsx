import type { LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, motion, radii } from '@/constants/theme';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  required?: boolean;
  icon?: LucideIcon;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  required = false,
  icon,
  hint,
  error,
  trailing,
  style,
  onFocus,
  onBlur,
  autoCapitalize = 'none',
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const focusProgress = useSharedValue(0);
  const hasError = Boolean(error);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: hasError
      ? colors.borderDanger
      : interpolateColor(focusProgress.get(), [0, 1], [colors.borderSubtle, colors.textTitle]),
  }));

  const animateFocus = (value: number) => {
    focusProgress.set(withTiming(value, { duration: motion.duration.base, easing: motion.easing.standard }));
  };

  return (
    <View style={style}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <Animated.View style={[styles.field, borderStyle]}>
        {icon && <Icon icon={icon} size={18} color={focused ? colors.textTitle : colors.textMuted} />}
        <TextInput
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          autoCapitalize={autoCapitalize}
          keyboardAppearance="light"
          placeholderTextColor={colors.textDisabled}
          selectionColor={colors.accent}
          style={styles.input}
          onFocus={(event) => {
            setFocused(true);
            animateFocus(1);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            animateFocus(0);
            onBlur?.(event);
          }}
        />
        {trailing}
      </Animated.View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[styles.helper, styles.error]}>
          {error}
        </Text>
      ) : (
        hint && <Text style={styles.helper}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.textBody,
    marginBottom: 8,
  },
  required: {
    color: colors.criticalText,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.input,
    borderCurve: 'continuous',
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textTitle,
    paddingVertical: 0,
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    marginTop: 6,
  },
  error: {
    color: colors.criticalText,
  },
});
