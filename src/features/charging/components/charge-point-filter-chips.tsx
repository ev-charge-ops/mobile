import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Chip } from '@/components/ui/chip';
import { motion, spacing } from '@/constants/theme';
import { powerFilters, type ChargePointFilters } from '@/features/charging/charge-point-filters';

export type ChargePointFilterChipsProps = {
  value: ChargePointFilters;
  onChange: (filters: ChargePointFilters) => void;
  delay?: number;
};

type ChipOption = {
  key: string;
  label: string;
  selected: boolean;
  next: ChargePointFilters;
};

export function ChargePointFilterChips({ value, onChange, delay = 0 }: ChargePointFilterChipsProps) {
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
          <Chip label={option.label} scheme="night" selected={option.selected} onPress={() => onChange(option.next)} />
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.lg,
  },
});
