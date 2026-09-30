import { ChevronLeft, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { colors, fonts, spacing } from '@/constants/theme';

export type AppBarVariant = 'default' | 'large' | 'modal';

export type AppBarProps = {
  title: string;
  subtitle?: string;
  variant?: AppBarVariant;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AppBar({
  title,
  subtitle,
  variant = 'default',
  onBack,
  backLabel = 'Voltar',
  actions,
  style,
}: AppBarProps) {
  const isLarge = variant === 'large';

  return (
    <View style={[styles.bar, isLarge && styles.barLarge, style]}>
      {onBack && (
        <View style={styles.back}>
          <IconButton icon={variant === 'modal' ? X : ChevronLeft} tone="surface" accessibilityLabel={backLabel} onPress={onBack} />
        </View>
      )}
      <View style={styles.titles}>
        <Text accessibilityRole="header" numberOfLines={1} style={[styles.title, isLarge && styles.titleLarge]}>
          {title}
        </Text>
        {subtitle && (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {actions}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: spacing.appBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  barLarge: {
    minHeight: 76,
    alignItems: 'flex-end',
    paddingBottom: spacing.md,
  },
  back: {
    marginRight: spacing.xs,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  titleLarge: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: fonts.bold,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    marginTop: 1,
  },
});
