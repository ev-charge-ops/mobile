import { Minus, Plus, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Slider } from '@/components/ui/slider';
import { colors, fonts, motion, radii, spacing } from '@/constants/theme';
import { formatCents } from '@/features/charging/charging-format';
import {
  clampDraft,
  ENERGY_PRESETS_KWH,
  estimateLimit,
  getAmountPresets,
  getLimitRange,
  getMaxAmountReais,
  getModeValue,
  REFERENCE_BATTERY_KWH,
  REFERENCE_SOC_PERCENT,
  setModeValue,
  SOC_PRESETS_PERCENT,
  stepDraft,
  type LimitDraft,
  type LimitMode,
} from '@/features/charging/charging-limit';
import { formatEnergy } from '@/utils/format-energy';

const modes = [
  { value: 'PERCENT', label: '%' },
  { value: 'ENERGY', label: 'kWh' },
  { value: 'AMOUNT', label: 'R$' },
] as const;

const modeLabels: Record<LimitMode, string> = {
  PERCENT: 'Limite em porcentagem da bateria',
  ENERGY: 'Limite em kWh',
  AMOUNT: 'Limite em reais',
};

type Preset = { label: string; value: number | null };

function getPresets(mode: LimitMode, pricePerKwhCents: number): Preset[] {
  const values =
    mode === 'PERCENT'
      ? SOC_PRESETS_PERCENT.map((soc) => ({ label: `${soc}%`, value: soc }))
      : mode === 'ENERGY'
        ? ENERGY_PRESETS_KWH.map((energy) => ({ label: `${energy} kWh`, value: energy }))
        : getAmountPresets(getMaxAmountReais(pricePerKwhCents)).map((amount) => ({
            label: `R$ ${amount}`,
            value: amount,
          }));
  return [...values, { label: 'Até encher', value: null }];
}

export function formatLimitReadout(draft: LimitDraft) {
  if (draft.type === 'FULL') return { prefix: null, value: 'Até encher', unit: null };
  if (draft.type === 'PERCENT') return { prefix: null, value: `${draft.socPercent}%`, unit: null };
  if (draft.type === 'ENERGY') {
    return { prefix: null, value: formatEnergy(draft.energyKwh, { fractionDigits: 0, withUnit: false }), unit: 'kWh' };
  }
  return { prefix: 'R$', value: String(draft.amountReais), unit: null };
}

export function formatLimitEquivalent(draft: LimitDraft, pricePerKwhCents: number) {
  const estimate = estimateLimit(draft, pricePerKwhCents);
  const energy = formatEnergy(estimate.energyKwh, { fractionDigits: 1 });
  const amount = formatCents(estimate.amountCents);
  if (draft.type === 'ENERGY') return `≈ ${amount} · até ${estimate.socPercent}%`;
  if (draft.type === 'AMOUNT') return `≈ ${energy} · até ${estimate.socPercent}%`;
  return `≈ ${energy} · ${amount}`;
}

function RoundButton({ icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      haptic="selection"
      scaleTo={0.9}
      style={styles.round}
    >
      <Icon icon={icon} size={20} color={colors.textTitle} />
    </PressableScale>
  );
}

export type ChargingLimitPickerProps = {
  value: LimitDraft;
  onChange: (value: LimitDraft) => void;
  pricePerKwhCents: number;
};

export function ChargingLimitPicker({ value, onChange, pricePerKwhCents }: ChargingLimitPickerProps) {
  const draft = clampDraft(value, pricePerKwhCents);
  const range = getLimitRange(draft.mode, pricePerKwhCents);
  const isFull = draft.type === 'FULL';
  const current = isFull ? range.max : getModeValue(draft);
  const readout = formatLimitReadout(draft);
  const presets = getPresets(draft.mode, pricePerKwhCents);

  return (
    <View style={styles.card}>
      <Animated.View key={`${draft.type}`} entering={FadeIn.duration(motion.duration.fast)} style={styles.readout}>
        <View style={styles.valueRow}>
          {readout.prefix ? <Text style={styles.affix}>{readout.prefix}</Text> : null}
          <Text testID="limit-value" style={[styles.value, isFull && styles.valueFull]}>
            {readout.value}
          </Text>
          {readout.unit ? <Text style={styles.affix}>{readout.unit}</Text> : null}
        </View>
        <Text testID="limit-equivalent" style={styles.equivalent}>
          {formatLimitEquivalent(draft, pricePerKwhCents)}
        </Text>
      </Animated.View>
      <View style={styles.controls}>
        <RoundButton
          icon={Minus}
          label="Diminuir limite"
          onPress={() => onChange(stepDraft(draft, -1, pricePerKwhCents))}
        />
        <Slider
          testID="limit-slider"
          accessibilityLabel={modeLabels[draft.mode]}
          valueText={readout.unit ? `${readout.value} ${readout.unit}` : readout.value}
          value={current}
          min={range.min}
          max={range.max}
          step={range.step}
          onChange={(next) => onChange(setModeValue(draft, next))}
          style={styles.slider}
        />
        <RoundButton
          icon={Plus}
          label="Aumentar limite"
          onPress={() => onChange(stepDraft(draft, 1, pricePerKwhCents))}
        />
      </View>
      <SegmentedControl
        options={modes}
        value={draft.mode}
        onChange={(mode) => onChange({ ...draft, type: mode, mode })}
        style={styles.segmented}
      />
      <View style={styles.presets}>
        {presets.map((preset) => {
          const selected = preset.value === null ? isFull : !isFull && current === preset.value;
          return (
            <PressableScale
              key={preset.label}
              accessibilityRole="button"
              accessibilityLabel={preset.label}
              accessibilityState={{ selected }}
              haptic="selection"
              scaleTo={0.95}
              onPress={() =>
                onChange(preset.value === null ? { ...draft, type: 'FULL' } : setModeValue(draft, preset.value))
              }
              style={[styles.preset, selected && styles.presetSelected]}
            >
              <Text style={[styles.presetLabel, selected && styles.presetLabelSelected]}>{preset.label}</Text>
            </PressableScale>
          );
        })}
      </View>
      <Text style={styles.footnote}>
        {`Estimativa para uma bateria de ${REFERENCE_BATTERY_KWH} kWh com ${REFERENCE_SOC_PERCENT}% de carga, ` +
          `a ${formatCents(pricePerKwhCents)} por kWh travado. ` +
          'A recarga encerra ao atingir o limite e você paga só o medido.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xxl,
    borderRadius: radii.xxl - 4,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  readout: {
    alignItems: 'center',
    gap: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  value: {
    fontSize: 48,
    lineHeight: 54,
    fontFamily: fonts.bold,
    letterSpacing: -1.9,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  valueFull: {
    fontSize: 40,
    letterSpacing: -1.4,
  },
  affix: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  equivalent: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    alignSelf: 'stretch',
  },
  round: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
  },
  slider: {
    flex: 1,
  },
  segmented: {
    alignSelf: 'stretch',
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  preset: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  presetLabel: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.textTitle,
  },
  presetLabelSelected: {
    fontFamily: fonts.bold,
    color: colors.textOnAccent,
  },
  footnote: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    textAlign: 'center',
  },
});
