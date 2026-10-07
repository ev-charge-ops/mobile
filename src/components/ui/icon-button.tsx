import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors } from '@/constants/theme';

export type IconButtonProps = {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress?: () => void;
  tone?: 'plain' | 'inset';
  size?: number;
};

export function IconButton({ icon, accessibilityLabel, onPress, tone = 'plain', size = 40 }: IconButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      scaleTo={0.92}
      hitSlop={4}
      style={[styles.button, { width: size, height: size, borderRadius: size / 2 }, tone === 'inset' && styles.inset]}
    >
      <Icon icon={icon} size={20} color={colors.textTitle} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inset: {
    backgroundColor: colors.surfaceInset,
  },
});
