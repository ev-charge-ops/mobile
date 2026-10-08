import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Rise } from '@/components/ui/rise';
import { motion } from '@/constants/theme';

export const STAGGER_STEP_MS = motion.revealStagger;

export type FadeInItemProps = PropsWithChildren<{
  index?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function FadeInItem(props: FadeInItemProps) {
  return <Rise {...props} />;
}
