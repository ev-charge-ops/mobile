import { Minus, Plus, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Slider } from '@/components/ui/slider';
import { colors, fonts, radii, spacing } from '@/constants/theme';
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
import { formatDuration } from '@/features/charging/session-timing';
import { haptics } from '@/lib/haptics';
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

function formatRangeValue(mode: LimitMode, value: number) {
  if (mode === 'PERCENT') return `${value}%`;
  if (mode === 'ENERGY') return `${value} kWh`;
  return `R$ ${value}`;
}

export function formatLimitReadout(draft: LimitDraft) {
  if (draft.type === 'FULL') return { prefix: null, value: 'Até encher', unit: null };
  if (draft.type === 'PERCENT') return { prefix: null, value: String(draft.socPercent), unit: '%' };
  if (draft.type === 'ENERGY') {
    return { prefix: null, value: formatEnergy(draft.energyKwh, { fractionDigits: 0, withUnit: false }), unit: 'kWh' };
  }
  return { prefix: 'R$', value: String(draft.amountReais), unit: null };
}

export function formatLimitEquivalent(draft: LimitDraft, pricePerKwhCents: number, maxPowerKw?: number) {
  const estimate = estimateLimit(draft, pricePerKwhCents);
  const energy = formatEnergy(estimate.energyKwh, { fractionDigits: 1 });
  const amount = formatCents(estimate.amountCents);
  const parts =
    draft.type === 'ENERGY'
      ? [`≈ ${amount}`, `até ${estimate.socPercent}%`]
      : draft.type === 'AMOUNT'
        ? [`≈ ${energy}`, `até ${estimate.socPercent}%`]
        : [`≈ ${energy}`, amount];
  if (maxPowerKw && maxPowerKw > 0 && estimate.energyKwh > 0) {
    parts.push(`pronta em cerca de ${formatDuration((estimate.energyKwh / maxPowerKw) * 3600)}`);
  }
  return parts.join(' · ');
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
  maxPowerKw?: number;
};

export function ChargingLimitPicker({ value, onChange, pricePerKwhCents, maxPowerKw }: ChargingLimitPickerProps) {
  const draft = clampDraft(value, pricePerKwhCents);
  const range = getLimitRange(draft.mode, pricePerKwhCents);
  const isFull = draft.type === 'FULL';
  const current = isFull ? range.max : getModeValue(draft);
  const readout = formatLimitReadout(draft);
  const presets = getPresets(draft.mode, pricePerKwhCents);
  const step = (direction: 1 | -1) => onChange(stepDraft(draft, direction, pricePerKwhCents));

  return (
    <View style={styles.root}>
      <View style={styles.modeGroup}>
        <Text style={styles.groupLabel}>Limitar por</Text>
        <SegmentedControl
          options={modes}
          value={draft.mode}
          onChange={(mode) => onChange({ ...draft, type: mode, mode })}
        />
      </View>
      <View accessibilityLiveRegion="polite" style={styles.valueRow}>
        {readout.prefix ? <Text style={styles.affix}>{readout.prefix}</Text> : null}
        <Text testID="limit-value" style={[styles.value, isFull && styles.valueFull]}>
          {readout.value}
        </Text>
        {readout.unit ? <Text style={styles.affix}>{readout.unit}</Text> : null}
      </View>
      <View style={styles.controls}>
        <RoundButton icon={Minus} label="Diminuir limite" onPress={() => step(-1)} />
        <Slider
          testID="limit-slider"
          accessibilityLabel={modeLabels[draft.mode]}
          valueText={[readout.prefix, readout.value, readout.unit].filter(Boolean).join(' ')}
          value={current}
          min={range.min}
          max={range.max}
          step={range.step}
          onChange={(next) => {
            haptics.selection();
            onChange(setModeValue(draft, next));
          }}
          style={styles.slider}
        />
        <RoundButton icon={Plus} label="Aumentar limite" onPress={() => step(1)} />
      </View>
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{formatRangeValue(draft.mode, range.min)}</Text>
        <Text style={styles.rangeLabel}>{formatRangeValue(draft.mode, range.max)}</Text>
      </View>
      <Text testID="limit-equivalent" style={styles.equivalent}>
        {formatLimitEquivalent(draft, pricePerKwhCents, maxPowerKw)}
      </Text>
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
        {`Estimativa para uma bateria de ${REFERENCE_BATTERY_KWH} kWh com ${REFERENCE_SOC_PERCENT}% de carga.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 14,
  },
  modeGroup: {
    alignSelf: 'stretch',
    gap: 6,
  },
  groupLabel: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: spacing.xs,
  },
  value: {
    fontSize: 64,
    lineHeight: 68,
    fontFamily: fonts.bold,
    letterSpacing: -3.2,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  valueFull: {
    fontSize: 44,
    lineHeight: 68,
    letterSpacing: -1.6,
  },
  affix: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.textMuted,
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
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingHorizontal: 66,
    marginTop: -10,
  },
  rangeLabel: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  equivalent: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.semibold,
    color: colors.textBody,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
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
