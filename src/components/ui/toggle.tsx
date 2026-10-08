import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, shadows } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

export type ToggleProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

const trackWidth = 50;
const trackHeight = 30;
const knobSize = 24;
const knobInset = 3;

export function Toggle({ checked, onChange, disabled = false, accessibilityLabel, testID }: ToggleProps) {
  const progress = useDerivedValue(
    () => withTiming(checked ? 1 : 0, { duration: motion.duration.base, easing: motion.easing.standard }),
    [checked],
  );

  const trackOff = disabled ? colors.surfaceRaised : colors.controlTrackOff;
  const trackOn = disabled ? colors.borderStrong : colors.controlTrackOn;

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [trackOff, trackOn]),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.get(), [0, 1], [knobInset, trackWidth - knobSize - knobInset]) }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      hitSlop={8}
      testID={testID}
      onPress={() => {
        haptics.selection();
        onChange?.(!checked);
      }}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View
          style={[
            styles.knob,
            disabled && styles.knobDisabled,
            knobStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: trackWidth,
    height: trackHeight,
    borderRadius: trackHeight / 2,
    justifyContent: 'center',
  },
  knob: {
    width: knobSize,
    height: knobSize,
    borderRadius: knobSize / 2,
    backgroundColor: colors.controlKnob,
    boxShadow: shadows.knob,
  },
  knobDisabled: {
    boxShadow: 'none',
  },
});
