import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { motion } from '@/constants/theme';

export const STAGGER_STEP_MS = 60;

export type FadeInItemProps = PropsWithChildren<{
  index?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function FadeInItem({ index = 0, style, testID, children }: FadeInItemProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(motion.duration.slow)
        .delay(index * STAGGER_STEP_MS)
        .easing(motion.easing.sheet)}
      style={style}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
}
