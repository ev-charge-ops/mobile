import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Chip } from '@/components/ui/chip';
import { motion, spacing } from '@/constants/theme';
import { chargePointFilters, type ChargePointFilter } from '@/features/charging/charge-point-filters';
import { haptics } from '@/lib/haptics';

export type ChargePointFilterChipsProps = {
  value: ChargePointFilter;
  onChange: (filter: ChargePointFilter) => void;
  delay?: number;
};

export function ChargePointFilterChips({ value, onChange, delay = 0 }: ChargePointFilterChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chargePointFilters.map((filter, index) => (
        <Animated.View
          key={filter.id}
          entering={FadeInDown.duration(motion.duration.sheet)
            .delay(delay + 40 * index)
            .easing(motion.easing.sheet)}
        >
          <Chip
            label={filter.label}
            selected={value === filter.id}
            onPress={() => {
              if (value === filter.id) return;
              haptics.selection();
              onChange(filter.id);
            }}
          />
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
});
