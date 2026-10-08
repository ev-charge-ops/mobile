import type { ChargingLimitInput } from '@/features/charging/api/charging-api';

export type LimitMode = 'PERCENT' | 'ENERGY' | 'AMOUNT';

export type LimitDraft = {
  type: 'FULL' | LimitMode;
  mode: LimitMode;
  socPercent: number;
  energyKwh: number;
  amountReais: number;
};

export const REFERENCE_BATTERY_KWH = 50;
export const REFERENCE_SOC_PERCENT = 42;

export const MIN_SOC_PERCENT = 50;
export const MAX_SOC_PERCENT = 100;
export const SOC_STEP_PERCENT = 5;
export const SOC_PRESETS_PERCENT = [60, 80, 90] as const;

export const MAX_ENERGY_KWH = 60;
export const MIN_ENERGY_KWH = 2;
export const ENERGY_STEP_KWH = 1;
export const ENERGY_PRESETS_KWH = [5, 10, 20] as const;

export const MIN_AMOUNT_REAIS = 10;
export const AMOUNT_STEP_REAIS = 5;

export const DEFAULT_LIMIT_DRAFT: LimitDraft = {
  type: 'PERCENT',
  mode: 'PERCENT',
  socPercent: 80,
  energyKwh: 10,
  amountReais: 30,
};

export function getMaxAmountReais(pricePerKwhCents: number) {
  const max = Math.ceil((MAX_ENERGY_KWH * pricePerKwhCents) / 100 / AMOUNT_STEP_REAIS) * AMOUNT_STEP_REAIS;
  return Math.max(MIN_AMOUNT_REAIS + AMOUNT_STEP_REAIS * 3, max);
}

export function getAmountPresets(maxReais: number) {
  const step = Math.max(
    AMOUNT_STEP_REAIS,
    Math.round((maxReais - MIN_AMOUNT_REAIS) / 3 / AMOUNT_STEP_REAIS) * AMOUNT_STEP_REAIS,
  );
  return [MIN_AMOUNT_REAIS, MIN_AMOUNT_REAIS + step, MIN_AMOUNT_REAIS + step * 2];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export type LimitRange = { min: number; max: number; step: number };

export function getLimitRange(mode: LimitMode, pricePerKwhCents: number): LimitRange {
  if (mode === 'PERCENT') return { min: MIN_SOC_PERCENT, max: MAX_SOC_PERCENT, step: SOC_STEP_PERCENT };
  if (mode === 'ENERGY') return { min: MIN_ENERGY_KWH, max: MAX_ENERGY_KWH, step: ENERGY_STEP_KWH };
  return { min: MIN_AMOUNT_REAIS, max: getMaxAmountReais(pricePerKwhCents), step: AMOUNT_STEP_REAIS };
}

export function clampDraft(draft: LimitDraft, pricePerKwhCents: number): LimitDraft {
  return {
    ...draft,
    socPercent: clamp(Math.round(draft.socPercent), MIN_SOC_PERCENT, MAX_SOC_PERCENT),
    energyKwh: clamp(draft.energyKwh, MIN_ENERGY_KWH, MAX_ENERGY_KWH),
    amountReais: clamp(draft.amountReais, MIN_AMOUNT_REAIS, getMaxAmountReais(pricePerKwhCents)),
  };
}

export function getModeValue(draft: LimitDraft, mode: LimitMode = draft.mode) {
  if (mode === 'PERCENT') return draft.socPercent;
  if (mode === 'ENERGY') return draft.energyKwh;
  return draft.amountReais;
}

export function setModeValue(draft: LimitDraft, value: number, mode: LimitMode = draft.mode): LimitDraft {
  if (mode === 'PERCENT') return { ...draft, type: mode, mode, socPercent: value };
  if (mode === 'ENERGY') return { ...draft, type: mode, mode, energyKwh: value };
  return { ...draft, type: mode, mode, amountReais: value };
}

export function stepDraft(draft: LimitDraft, direction: 1 | -1, pricePerKwhCents: number): LimitDraft {
  const range = getLimitRange(draft.mode, pricePerKwhCents);
  const current = draft.type === 'FULL' ? range.max : getModeValue(draft);
  const next = clamp(Math.round(current / range.step) * range.step + direction * range.step, range.min, range.max);
  return setModeValue(draft, next);
}

export function toLimitInput(draft: LimitDraft, pricePerKwhCents: number): ChargingLimitInput {
  const clamped = clampDraft(draft, pricePerKwhCents);
  if (clamped.type === 'PERCENT') return { type: 'PERCENT', value: clamped.socPercent };
  if (clamped.type === 'ENERGY') return { type: 'ENERGY', value: clamped.energyKwh };
  if (clamped.type === 'AMOUNT') return { type: 'AMOUNT', value: Math.round(clamped.amountReais * 100) };
  return { type: 'FULL' };
}

export function amountToEnergyKwh(amountReais: number, pricePerKwhCents: number) {
  if (pricePerKwhCents <= 0) return 0;
  return (amountReais * 100) / pricePerKwhCents;
}

export function energyToAmountCents(energyKwh: number, pricePerKwhCents: number) {
  return Math.round(energyKwh * pricePerKwhCents);
}

export function socToEnergyKwh(socPercent: number) {
  return (Math.max(0, socPercent - REFERENCE_SOC_PERCENT) / 100) * REFERENCE_BATTERY_KWH;
}

export function energyToSocPercent(energyKwh: number) {
  return Math.min(MAX_SOC_PERCENT, Math.round(REFERENCE_SOC_PERCENT + (energyKwh / REFERENCE_BATTERY_KWH) * 100));
}

export type LimitEstimate = {
  energyKwh: number;
  amountCents: number;
  socPercent: number;
};

export function estimateLimit(draft: LimitDraft, pricePerKwhCents: number): LimitEstimate {
  const clamped = clampDraft(draft, pricePerKwhCents);
  const fullEnergy = socToEnergyKwh(MAX_SOC_PERCENT);
  const energyKwh =
    clamped.type === 'FULL'
      ? fullEnergy
      : clamped.type === 'PERCENT'
        ? socToEnergyKwh(clamped.socPercent)
        : Math.min(
            fullEnergy,
            clamped.type === 'ENERGY' ? clamped.energyKwh : amountToEnergyKwh(clamped.amountReais, pricePerKwhCents),
          );
  return {
    energyKwh,
    amountCents: energyToAmountCents(energyKwh, pricePerKwhCents),
    socPercent: energyToSocPercent(energyKwh),
  };
}
