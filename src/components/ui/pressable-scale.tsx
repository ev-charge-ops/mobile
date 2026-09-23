import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { motion } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type HapticFeedback = keyof typeof haptics;

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean | HapticFeedback;
};

export function triggerHaptic(haptic: boolean | HapticFeedback | undefined) {
  if (!haptic) return;
  haptics[haptic === true ? 'impactLight' : haptic]();
}

export function PressableScale({
  style,
  scaleTo = motion.pressScale,
  haptic,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const animateTo = (value: number) => {
    scale.set(withTiming(value, { duration: motion.duration.fast, easing: motion.easing.standard }));
  };

  return (
    <AnimatedPressable
      {...rest}
      onPress={(event) => {
        triggerHaptic(haptic);
        onPress?.(event);
      }}
      onPressIn={(event) => {
        animateTo(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
