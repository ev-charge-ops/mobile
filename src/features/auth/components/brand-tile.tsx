import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';

export const BRAND_RING_PATH = 'M45.02 42.93 A17 17 0 1 1 45.02 21.07';
export const BRAND_BOLT_PATH = 'M34 20 L24 34 H31 L29 44 L40 29 H33 Z';
export const BRAND_NODE = { cx: 45.02, cy: 21.07, r: 3.4 } as const;

export type BrandTileProps = {
  size?: number;
  testID?: string;
};

export function BrandTile({ size = 26, testID }: BrandTileProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" testID={testID}>
      <Rect width={64} height={64} rx={18} fill={colors.surfaceInverse} />
      <Path d={BRAND_RING_PATH} fill="none" stroke={colors.textOnInverse} strokeWidth={5} strokeLinecap="round" />
      <Path d={BRAND_BOLT_PATH} fill={colors.energyBright} />
      <Circle cx={BRAND_NODE.cx} cy={BRAND_NODE.cy} r={BRAND_NODE.r} fill={colors.energyBright} />
    </Svg>
  );
}
