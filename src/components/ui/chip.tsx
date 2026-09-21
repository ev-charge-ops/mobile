import { StyleSheet, Text } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, radii } from '@/constants/theme';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      scaleTo={0.95}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderColor: 'transparent',
    backgroundColor: colors.surfaceInset,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textSubtle,
  },
  labelSelected: {
    color: colors.textTitle,
  },
});
