import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { getColors, radii, spacing, typography, type ColorScheme } from '@/constants/theme';

export type CardVariant = 'default' | 'large' | 'inset';

export type CardProps = PropsWithChildren<{
  padding?: number;
  variant?: CardVariant;
  scheme?: ColorScheme;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function Card({
  children,
  padding = spacing.cardPadding,
  variant = 'default',
  scheme = 'light',
  style,
  testID,
}: CardProps) {
  const tokens = getColors(scheme);
  const variantStyle: ViewStyle =
    variant === 'inset'
      ? { backgroundColor: tokens.surfaceInset, borderRadius: radii.lg }
      : { backgroundColor: tokens.surfaceCard, borderRadius: variant === 'large' ? radii.cardLarge : radii.card };

  return (
    <View testID={testID} style={[styles.card, variantStyle, { padding }, style]}>
      {children}
    </View>
  );
}

export type SectionTitleProps = {
  children: string;
  style?: StyleProp<TextStyle>;
};

export function SectionTitle({ children, style }: SectionTitleProps) {
  return (
    <Text accessibilityRole="header" style={[styles.sectionTitle, style]}>
      {children}
    </Text>
  );
}

export type DividerProps = {
  scheme?: ColorScheme;
  style?: StyleProp<ViewStyle>;
};

export function Divider({ scheme = 'light', style }: DividerProps) {
  return <View style={[styles.divider, { backgroundColor: getColors(scheme).hairline }, style]} />;
}

const styles = StyleSheet.create({
  card: {
    borderCurve: 'continuous',
  },
  sectionTitle: {
    ...typography.eyebrow,
    marginTop: spacing.sm,
    marginBottom: -spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  divider: {
    height: 1,
  },
});
