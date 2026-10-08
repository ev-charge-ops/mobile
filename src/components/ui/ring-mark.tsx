import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/constants/theme';

export type RingMarkProps = {
  size?: number;
  ringColor?: string;
  boltColor?: string;
  nodeColor?: string | null;
  testID?: string;
};

export function RingMark({
  size = 32,
  ringColor = colors.textTitle,
  boltColor = colors.energy,
  nodeColor = colors.energy,
  testID,
}: RingMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" testID={testID} accessible={false}>
      <Path
        d="M45.02 42.93 A17 17 0 1 1 45.02 21.07"
        fill="none"
        stroke={ringColor}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <Path d="M34 20 L24 34 H31 L29 44 L40 29 H33 Z" fill={boltColor} />
      {nodeColor ? <Circle cx={45.02} cy={21.07} r={3.4} fill={nodeColor} /> : null}
    </Svg>
  );
}
