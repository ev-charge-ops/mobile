import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { colors, fonts, motion, radii } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const trackPadding = 4;

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
  testID,
}: SegmentedControlProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const segmentWidth = width > 0 ? (width - trackPadding * 2) / options.length : 0;

  const offset = useDerivedValue(
    () => withTiming(index * segmentWidth, { duration: motion.duration.base, easing: motion.easing.standard }),
    [index, segmentWidth],
  );
  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));

  return (
    <View
      accessibilityRole="tablist"
      testID={testID}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.track, style]}
    >
      {segmentWidth > 0 ? <Animated.View style={[styles.indicator, { width: segmentWidth }, indicatorStyle]} /> : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              haptics.selection();
              onChange(option.value);
            }}
            style={styles.option}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 44,
    padding: trackPadding,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceCard,
  },
  indicator: {
    position: 'absolute',
    top: trackPadding,
    bottom: trackPadding,
    left: trackPadding,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
    color: colors.textSubtle,
  },
  labelSelected: {
    color: colors.textTitle,
  },
});
