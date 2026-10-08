import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Zap, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { StatusDot } from '@/components/ui/status-pill';
import { fonts, getColors, motion, radii, shadows, spacing, type ColorScheme } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

export type TabBarItem = {
  name: string;
  label: string;
  icon: LucideIcon;
  night?: boolean;
  badge?: boolean;
  badgeLabel?: string;
};

export type TabBarAction = {
  accessibilityLabel: string;
  onPress: () => void;
  live?: boolean;
};

export type TabBarProps = BottomTabBarProps & {
  items: TabBarItem[];
  action?: TabBarAction;
};

export const TAB_BAR_MIN_BOTTOM_INSET = 16;
export const TAB_BAR_SIDE_INSET = 12;
const itemSize = 46;
const barPadding = (spacing.tabBarHeight - itemSize) / 2;
const layoutTransition = LinearTransition.duration(motion.duration.slow).easing(motion.easing.out);

function getAccessibilityLabel(item: TabBarItem) {
  return item.badge && item.badgeLabel ? `${item.label}, ${item.badgeLabel}` : item.label;
}

export function useTabBarBottomOffset() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_INSET);
}

export function useTabBarHeight() {
  return spacing.tabBarHeight + useTabBarBottomOffset();
}

export function TabBar({ state, navigation, items, action }: TabBarProps) {
  const bottom = useTabBarBottomOffset();
  const activeRoute = state.routes[state.index];
  const activeItem = items.find((item) => item.name === activeRoute?.name);
  const scheme: ColorScheme = activeItem?.night ? 'night' : 'light';
  const tokens = getColors(scheme);
  const hasGlass = isLiquidGlassAvailable();

  return (
    <View testID="tab-bar" pointerEvents="box-none" style={[styles.bar, { bottom }]}>
      <View
        testID={`tab-bar-${scheme}`}
        style={[
          styles.pill,
          { boxShadow: scheme === 'light' ? shadows.floating : 'none' },
          !hasGlass && { backgroundColor: tokens.surfaceNav },
        ]}
      >
        {hasGlass ? (
          <GlassView
            glassEffectStyle="regular"
            colorScheme={scheme === 'night' ? 'dark' : 'light'}
            tintColor={tokens.surfaceNav}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View accessibilityRole="tablist" style={styles.row}>
          {state.routes.map((route, index) => {
            const item = items.find((candidate) => candidate.name === route.name);
            if (!item) return null;
            const isActive = state.index === index;

            return (
              <TabBarButton
                key={route.key}
                item={item}
                scheme={scheme}
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
      {action ? <TabBarFab action={action} scheme={scheme} /> : null}
    </View>
  );
}

type TabBarButtonProps = {
  item: TabBarItem;
  scheme: ColorScheme;
  isActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function TabBarButton({ item, scheme, isActive, onPress, onLongPress }: TabBarButtonProps) {
  const tokens = getColors(scheme);
  const color = isActive ? tokens.textOnAccent : tokens.textMuted;

  return (
    <Animated.View layout={layoutTransition}>
      <PressableScale
        accessibilityRole="tab"
        accessibilityLabel={getAccessibilityLabel(item)}
        accessibilityState={{ selected: isActive }}
        onPress={onPress}
        onLongPress={onLongPress}
        testID={`tab-${item.name}`}
        style={[styles.item, isActive && [styles.itemActive, { backgroundColor: tokens.accent }]]}
      >
        <View>
          <Icon icon={item.icon} size={20} color={color} />
          {item.badge ? (
            <View
              testID={`tab-badge-${item.name}`}
              style={[
                styles.badge,
                { backgroundColor: tokens.critical, borderColor: isActive ? tokens.accent : tokens.surfaceCard },
              ]}
            />
          ) : null}
        </View>
        {isActive ? (
          <Text numberOfLines={1} style={[styles.label, { color }]}>
            {item.label}
          </Text>
        ) : null}
      </PressableScale>
    </Animated.View>
  );
}

type TabBarFabProps = {
  action: TabBarAction;
  scheme: ColorScheme;
};

function TabBarFab({ action, scheme }: TabBarFabProps) {
  const tokens = getColors(scheme);
  const isNight = scheme === 'night';

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={action.accessibilityLabel}
      haptic
      onPress={action.onPress}
      testID="tab-bar-action"
      style={[
        styles.fab,
        {
          backgroundColor: tokens.surfaceInverse,
          boxShadow: isNight ? 'none' : shadows.floatingStrong,
        },
      ]}
    >
      <Icon icon={Zap} size={24} color={isNight ? getColors('light').energy : tokens.energyBright} />
      {action.live ? (
        <View testID="tab-bar-action-live" style={styles.fabLive}>
          <StatusDot color={tokens.energyBright} size={10} live />
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: TAB_BAR_SIDE_INSET,
    right: TAB_BAR_SIDE_INSET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flex: 1,
    height: spacing.tabBarHeight,
    borderRadius: radii.pill,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: barPadding,
  },
  item: {
    height: itemSize,
    minWidth: itemSize,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  itemActive: {
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  fab: {
    width: spacing.tabBarHeight,
    height: spacing.tabBarHeight,
    borderRadius: spacing.tabBarHeight / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLive: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
});
