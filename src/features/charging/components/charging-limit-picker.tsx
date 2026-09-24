import Slider from '@react-native-community/slider';
import { BatteryCharging, SlidersHorizontal } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Card, Divider } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { colors, fonts, motion, radii, spacing } from '@/constants/theme';
import { formatAmount, formatCents } from '@/features/charging/charging-format';
import {
  AMOUNT_STEP_REAIS,
  amountToEnergyKwh,
  clampDraft,
  ENERGY_PRESETS_KWH,
  ENERGY_STEP_KWH,
  energyToAmountCents,
  getAmountPresets,
  getMaxAmountReais,
  MAX_ENERGY_KWH,
  MIN_AMOUNT_REAIS,
  MIN_ENERGY_KWH,
  type LimitDraft,
  type LimitMode,
} from '@/features/charging/charging-limit';
import { formatEnergy } from '@/utils/format-energy';

const modes = [
  { value: 'AMOUNT', label: 'Por valor' },
  { value: 'ENERGY', label: 'Por energia' },
] as const;

export type ChargingLimitPickerProps = {
  value: LimitDraft;
  onChange: (value: LimitDraft) => void;
  pricePerKwhCents: number;
};

export function ChargingLimitPicker({ value, onChange, pricePerKwhCents }: ChargingLimitPickerProps) {
  const draft = clampDraft(value, pricePerKwhCents);
  const update = (patch: Partial<LimitDraft>) => onChange({ ...draft, ...patch });

  if (draft.type === 'FULL') {
    return (
      <Card>
        <View style={styles.fullRow}>
          <View style={styles.tile}>
            <Icon icon={BatteryCharging} size={22} color={colors.statusCharging} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.fullTitle}>Até encher</Text>
            <Text style={styles.hint}>{`${formatCents(pricePerKwhCents)} por kWh · tarifa travada`}</Text>
          </View>
        </View>
        <Text style={styles.prose}>A recarga vai até o veículo parar de aceitar carga. Você paga só o kWh medido.</Text>
        <Divider style={styles.divider} />
        <Button
          label="Definir um limite"
          icon={SlidersHorizontal}
          variant="outline"
          block
          haptic="selection"
          onPress={() => update({ type: 'AMOUNT' })}
        />
      </Card>
    );
  }

  const mode: LimitMode = draft.type;
  const isAmount = mode === 'AMOUNT';
  const maxAmount = getMaxAmountReais(pricePerKwhCents);
  const presets = isAmount
    ? getAmountPresets(maxAmount).map((amount) => ({ value: amount, label: `R$ ${amount}` }))
    : ENERGY_PRESETS_KWH.map((energy) => ({ value: energy, label: `${energy} kWh` }));
  const current = isAmount ? draft.amountReais : draft.energyKwh;
  const display = isAmount
    ? formatAmount(draft.amountReais * 100)
    : formatEnergy(draft.energyKwh, { withUnit: false, fractionDigits: 1 });
  const equivalent = isAmount
    ? `≈ ${formatEnergy(amountToEnergyKwh(draft.amountReais, pricePerKwhCents), { fractionDigits: 1 })}`
    : `≈ ${formatCents(energyToAmountCents(draft.energyKwh, pricePerKwhCents))}`;

  const setCurrent = (next: number) => update(isAmount ? { amountReais: next } : { energyKwh: next });

  return (
    <Card>
      <SegmentedControl
        options={modes}
        value={mode}
        onChange={(type) => update({ type })}
        style={styles.segmented}
      />
      <Animated.View key={mode} entering={FadeIn.duration(motion.duration.base)}>
        <View style={styles.numberRow}>
          <View style={styles.numberPair}>
            {isAmount ? <Text style={styles.prefix}>R$</Text> : null}
            <Text style={styles.number} testID="limit-value">
              {display}
            </Text>
            {isAmount ? null : <Text style={styles.unit}>kWh</Text>}
          </View>
          <View style={styles.equivalent}>
            <Text style={styles.equivalentValue}>{equivalent}</Text>
            <Text style={styles.equivalentLabel}>{`a ${formatCents(pricePerKwhCents)} por kWh`}</Text>
          </View>
        </View>
        <Slider
          testID="limit-slider"
          accessibilityLabel={isAmount ? 'Limite em reais' : 'Limite em kWh'}
          style={styles.slider}
          minimumValue={isAmount ? MIN_AMOUNT_REAIS : MIN_ENERGY_KWH}
          maximumValue={isAmount ? maxAmount : MAX_ENERGY_KWH}
          step={isAmount ? AMOUNT_STEP_REAIS : ENERGY_STEP_KWH}
          value={current}
          onValueChange={setCurrent}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.meterTrack}
          thumbTintColor={colors.controlKnob}
        />
        <View style={styles.presets}>
          {presets.map((preset) => {
            const selected = current === preset.value;
            return (
              <PressableScale
                key={preset.label}
                accessibilityRole="button"
                accessibilityLabel={preset.label}
                accessibilityState={{ selected }}
                haptic="selection"
                scaleTo={0.95}
                onPress={() => setCurrent(preset.value)}
                style={[styles.preset, selected && styles.presetSelected]}
              >
                <Text style={[styles.presetLabel, selected && styles.presetLabelSelected]}>{preset.label}</Text>
              </PressableScale>
            );
          })}
        </View>
      </Animated.View>
      <Divider style={styles.divider} />
      <View style={styles.footer}>
        <View style={styles.flex}>
          <Text style={styles.footerTitle}>Encerra ao atingir o limite</Text>
          <Text style={styles.footerHint}>Você paga só o que for medido até lá</Text>
        </View>
        <Button label="Remover" variant="ghost" size="sm" haptic="selection" onPress={() => update({ type: 'FULL' })} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },
  fullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tile: {
    width: 44,
    height: 44,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
  },
  fullTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  hint: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 2,
  },
  prose: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  segmented: {
    marginBottom: 18,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  numberPair: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  prefix: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textSubtle,
  },
  number: {
    fontSize: 38,
    lineHeight: 42,
    fontFamily: fonts.bold,
    letterSpacing: -0.6,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textSubtle,
  },
  equivalent: {
    alignItems: 'flex-end',
  },
  equivalentValue: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  equivalentLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 1,
  },
  slider: {
    marginTop: 14,
    height: 34,
  },
  presets: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  preset: {
    flex: 1,
    height: 36,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetSelected: {
    borderColor: 'transparent',
    backgroundColor: colors.surfaceInset,
  },
  presetLabel: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textSubtle,
  },
  presetLabelSelected: {
    color: colors.textTitle,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  footerHint: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 1,
  },
});
