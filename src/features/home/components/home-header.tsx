import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';

export type HomeHeaderProps = {
  greeting: string;
  initials: string;
  subtitle: string | null;
  actions?: ReactNode;
};

export function HomeHeader({ greeting, initials, subtitle, actions }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Abrir conta"
        scaleTo={0.92}
        onPress={() => router.navigate('/account')}
        style={styles.avatar}
        testID="home-avatar"
      >
        <Text style={styles.initials}>{initials}</Text>
      </PressableScale>
      <View style={styles.titles}>
        <Text accessibilityRole="header" numberOfLines={1} style={styles.greeting}>
          {greeting}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textOnInverse,
  },
  titles: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  greeting: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});
