import type { LucideIcon } from 'lucide-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';

export type IconProps = {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Icon({
  icon: IconComponent,
  size = 22,
  color = colors.textBody,
  strokeWidth = 2,
  style,
  testID,
}: IconProps) {
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} style={style} testID={testID} />;
}
