import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { getColors, type ColorScheme, type ThemeColors } from '@/constants/theme';

export type IconButtonTone = 'plain' | 'inset' | 'surface' | 'inverse';

export type IconButtonProps = {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress?: () => void;
  tone?: IconButtonTone;
  scheme?: ColorScheme;
  size?: number;
  badge?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

function getToneStyle(tokens: ThemeColors, tone: IconButtonTone) {
  switch (tone) {
    case 'inset':
      return { backgroundColor: tokens.surfaceInset, color: tokens.textTitle };
    case 'surface':
      return { backgroundColor: tokens.surfaceCard, color: tokens.textTitle };
    case 'inverse':
      return { backgroundColor: tokens.surfaceInverse, color: tokens.textOnInverse };
    default:
      return { backgroundColor: 'transparent', color: tokens.textTitle };
  }
}

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  tone = 'plain',
  scheme = 'light',
  size = 44,
  badge = false,
  loading = false,
  style,
  testID,
}: IconButtonProps) {
  const tokens = getColors(scheme);
  const toneStyle = getToneStyle(tokens, tone);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={loading}
      accessibilityState={{ disabled: loading, busy: loading }}
      scaleTo={0.92}
      hitSlop={4}
      testID={testID}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: toneStyle.backgroundColor },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={toneStyle.color} />
      ) : (
        <Icon icon={icon} size={20} color={toneStyle.color} />
      )}
      {badge ? (
        <View
          testID={testID ? `${testID}-badge` : 'icon-button-badge'}
          style={[
            styles.badge,
            {
              top: size * 0.22,
              right: size * 0.24,
              backgroundColor: tokens.critical,
              borderColor: tone === 'plain' ? tokens.bgBase : toneStyle.backgroundColor,
            },
          ]}
        />
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
});
