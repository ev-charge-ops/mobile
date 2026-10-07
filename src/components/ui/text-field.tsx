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
      : interpolateColor(focusProgress.get(), [0, 1], [colors.borderSubtle, colors.borderStrong]),
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
        {icon && <Icon icon={icon} size={17} color={focused ? colors.textMuted : colors.textDisabled} />}
        <TextInput
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          autoCapitalize={autoCapitalize}
          keyboardAppearance="dark"
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
    fontSize: 13.5,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
    marginBottom: 7,
  },
  required: {
    color: colors.accent,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.input,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.textTitle,
    paddingVertical: 0,
  },
  helper: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 6,
  },
  error: {
    color: colors.statusFault,
  },
});
