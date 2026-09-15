import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/theme';

export type CardProps = PropsWithChildren<{
  padding?: number;
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ children, padding = spacing.cardPadding, style }: CardProps) {
  return <View style={[styles.card, { padding }, style]}>{children}</View>;
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
  style?: StyleProp<ViewStyle>;
};

export function Divider({ style }: DividerProps) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.card,
  },
  sectionTitle: {
    ...typography.eyebrow,
    marginTop: spacing.sm,
    marginBottom: -spacing.xxs,
    paddingHorizontal: spacing.xxs,
  },
  divider: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.hairline,
  },
});
