import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';

import { motion } from '@/constants/theme';

export const RISE_MAX_INDEX = 12;

export function getRiseDelay(index: number) {
  return Math.min(Math.max(0, index), RISE_MAX_INDEX) * motion.revealStagger;
}

export function riseEntering(index = 0) {
  return FadeInUp.withInitialValues({ opacity: 0, transform: [{ translateY: motion.riseDistance }] })
    .duration(motion.duration.rise)
    .delay(getRiseDelay(index))
    .easing(motion.easing.out)
    .reduceMotion(ReduceMotion.System);
}

export type RiseProps = PropsWithChildren<{
  index?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function Rise({ index = 0, style, testID, children }: RiseProps) {
  return (
    <Animated.View entering={riseEntering(index)} style={style} testID={testID}>
      {children}
    </Animated.View>
  );
}
