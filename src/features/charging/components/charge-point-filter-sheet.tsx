import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Sheet } from '@/components/ui/sheet';
import { fonts, nightColors, spacing } from '@/constants/theme';
import {
  countActiveFilters,
  DEFAULT_CHARGE_POINT_FILTERS,
  powerFilters,
  regimeFilters,
  type ChargePointFilters,
} from '@/features/charging/charge-point-filters';

export type ChargePointFilterSheetProps = {
  visible: boolean;
  value: ChargePointFilters;
  resultCount: number;
  onChange: (filters: ChargePointFilters) => void;
  onClose: () => void;
};

function formatResultCount(count: number) {
  if (count === 0) return 'Nenhum ponto';
  return count === 1 ? 'Ver 1 ponto' : `Ver ${count} pontos`;
}

export function ChargePointFilterSheet({
  visible,
  value,
  resultCount,
  onChange,
  onClose,
}: ChargePointFilterSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} scheme="night" closeLabel="Fechar filtros">
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Filtros
        </Text>
        <View style={styles.section}>
          <Text style={styles.eyebrow}>Disponibilidade</Text>
          <View style={styles.row}>
            <Chip
              label="Todos"
              scheme="night"
              selected={!value.availableOnly}
              onPress={() => onChange({ ...value, availableOnly: false })}
            />
            <Chip
              label="Livres agora"
              scheme="night"
              selected={value.availableOnly}
              onPress={() => onChange({ ...value, availableOnly: true })}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.eyebrow}>Potência</Text>
          <View style={styles.row}>
            <Chip
              label="Qualquer"
              scheme="night"
              selected={value.power === 'ANY'}
              onPress={() => onChange({ ...value, power: 'ANY' })}
            />
            {powerFilters.map((power) => (
              <Chip
                key={power.id}
                label={power.label}
                scheme="night"
                selected={value.power === power.id}
                onPress={() => onChange({ ...value, power: power.id })}
              />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.eyebrow}>Regime</Text>
          <View style={styles.row}>
            {regimeFilters.map((regime) => (
              <Chip
                key={regime.id}
                label={regime.label}
                scheme="night"
                selected={value.regime === regime.id}
                onPress={() => onChange({ ...value, regime: regime.id })}
              />
            ))}
          </View>
        </View>
        <View style={styles.actions}>
          <Button label={formatResultCount(resultCount)} scheme="night" size="lg" block haptic onPress={onClose} />
          <Button
            label="Limpar filtros"
            variant="ghost"
            scheme="night"
            block
            disabled={countActiveFilters(value) === 0}
            onPress={() => onChange(DEFAULT_CHARGE_POINT_FILTERS)}
          />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fonts.bold,
    letterSpacing: -0.4,
    color: nightColors.textTitle,
  },
  section: {
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.bold,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    color: nightColors.textMuted,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.xs,
  },
});
