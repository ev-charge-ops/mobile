import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Chip } from '@/components/ui/chip';
import { colors, motion, spacing, type ColorScheme } from '@/constants/theme';
import { powerFilters, type ChargePointFilters } from '@/features/charging/charge-point-filters';

export type ChargePointFilterChipsProps = {
  value: ChargePointFilters;
  onChange: (filters: ChargePointFilters) => void;
  delay?: number;
  scheme?: ColorScheme;
};

type ChipOption = {
  key: string;
  label: string;
  selected: boolean;
  next: ChargePointFilters;
};

export function ChargePointFilterChips({ value, onChange, delay = 0, scheme = 'night' }: ChargePointFilterChipsProps) {
  const options: ChipOption[] = [
    {
      key: 'available',
      label: 'Livres agora',
      selected: value.availableOnly,
      next: { ...value, availableOnly: !value.availableOnly },
    },
    ...powerFilters.map((power) => ({
      key: power.id,
      label: power.label,
      selected: value.power === power.id,
      next: { ...value, power: value.power === power.id ? ('ANY' as const) : power.id },
    })),
    {
      key: 'private',
      label: 'Condomínio',
      selected: value.regime === 'PRIVATE',
      next: { ...value, regime: value.regime === 'PRIVATE' ? ('ALL' as const) : ('PRIVATE' as const) },
    },
    {
      key: 'commercial',
      label: 'Comercial',
      selected: value.regime === 'COMMERCIAL',
      next: { ...value, regime: value.regime === 'COMMERCIAL' ? ('ALL' as const) : ('COMMERCIAL' as const) },
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
    >
      {options.map((option, index) => (
        <Animated.View
          key={option.key}
          entering={FadeInDown.duration(motion.duration.sheet)
            .delay(delay + motion.revealStagger * index)
            .easing(motion.easing.out)}
        >
          <Chip
            label={option.label}
            scheme={scheme}
            selected={option.selected}
            onPress={() => onChange(option.next)}
            style={scheme === 'light' && !option.selected ? styles.lightChip : undefined}
          />
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lightChip: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
  },
  row: {
    gap: spacing.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.lg,
  },
});
