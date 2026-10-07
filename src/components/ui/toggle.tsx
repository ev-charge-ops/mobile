import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

export type ToggleProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

const trackWidth = 46;
const trackHeight = 28;
const knobSize = 22;
const knobInset = 3;

export function Toggle({ checked, onChange, disabled = false, accessibilityLabel, testID }: ToggleProps) {
  const progress = useDerivedValue(
    () => withTiming(checked ? 1 : 0, { duration: motion.duration.base, easing: motion.easing.standard }),
    [checked],
  );

  const trackOff = disabled ? colors.surfaceInset : colors.controlTrackOff;
  const trackOn = disabled ? colors.surfaceRaised : colors.controlTrackOn;

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
            disabled && { backgroundColor: checked ? colors.textMuted : colors.textDisabled },
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
  },
});
