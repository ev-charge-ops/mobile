import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, motion, spacing } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

export type TabBarItem = {
  name: string;
  label: string;
  icon: LucideIcon;
  badge?: boolean;
  badgeLabel?: string;
  badgeCount?: number;
  badgeCountLabel?: (count: number) => string;
};

export function formatBadgeCount(count: number) {
  return count > 99 ? '99+' : String(count);
}

function getAccessibilityLabel(item: TabBarItem) {
  const parts = [item.label];
  if (item.badge && item.badgeLabel) parts.push(item.badgeLabel);
  if (item.badgeCount && item.badgeCount > 0) parts.push(item.badgeCountLabel?.(item.badgeCount) ?? String(item.badgeCount));
  return parts.join(', ');
}

export type TabBarProps = BottomTabBarProps & {
  items: TabBarItem[];
};

export const TAB_BAR_MIN_BOTTOM_INSET = 10;

export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  return spacing.tabBarHeight + Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_INSET);
}

export function TabBar({ state, navigation, items }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const hasGlass = isLiquidGlassAvailable();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_INSET) }]}>
      {hasGlass ? (
        <GlassView
          glassEffectStyle="regular"
          colorScheme="light"
          tintColor={colors.surfaceNav}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} />
      )}
      <View style={[StyleSheet.absoluteFill, styles.overlay, hasGlass && styles.overlayGlass]} />
      <View accessibilityRole="tablist" style={styles.row}>
        {state.routes.map((route, index) => {
          const item = items.find((candidate) => candidate.name === route.name);
          if (!item) return null;
          const isActive = state.index === index;

          return (
            <TabBarButton
              key={route.key}
              item={item}
              isActive={isActive}
              onPress={() => {
                haptics.selection();
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!isActive && !event.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
      </View>
    </View>
  );
}

type TabBarButtonProps = {
  item: TabBarItem;
  isActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function TabBarButton({ item, isActive, onPress, onLongPress }: TabBarButtonProps) {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(isActive ? 1 : 0, { duration: motion.duration.fast, easing: motion.easing.standard }));
  }, [isActive, progress]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 * progress.get() }, { scale: 1 + 0.06 * progress.get() }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.get(), [0, 1], [colors.textMuted, colors.textTitle]),
  }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: progress.get() }],
  }));

  const accessibilityLabel = getAccessibilityLabel(item);
  const count = item.badgeCount ?? 0;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.item}
    >
      <Animated.View style={iconStyle}>
        <Icon icon={item.icon} size={22} color={isActive ? colors.textTitle : colors.textMuted} />
        {item.badge ? <View testID={`tab-badge-${item.name}`} style={styles.badge} /> : null}
        {count > 0 ? (
          <View testID={`tab-count-${item.name}`} style={styles.count}>
            <Text style={styles.countLabel}>{formatBadgeCount(count)}</Text>
          </View>
        ) : null}
      </Animated.View>
      <Animated.Text style={[styles.label, labelStyle]}>{item.label}</Animated.Text>
      <Animated.View style={[styles.dot, dotStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: colors.surfaceNav,
  },
  overlay: {
    backgroundColor: colors.surfaceNav,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  overlayGlass: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.energy,
    borderWidth: 1.5,
    borderColor: colors.bgBase,
  },
  count: {
    position: 'absolute',
    top: -5,
    left: 14,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.critical,
    borderWidth: 1.5,
    borderColor: colors.bgBase,
  },
  countLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: fonts.extrabold,
    color: colors.textOnAccent,
    fontVariant: ['tabular-nums'],
  },
});
