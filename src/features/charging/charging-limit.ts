import type { ChargingLimitInput } from '@/features/charging/api/charging-api';

export type LimitMode = 'AMOUNT' | 'ENERGY';

export type LimitDraft = {
  type: 'FULL' | LimitMode;
  amountReais: number;
  energyKwh: number;
};

export const MAX_ENERGY_KWH = 60;
export const MIN_ENERGY_KWH = 2;
export const ENERGY_STEP_KWH = 1;
export const ENERGY_PRESETS_KWH = [5, 10, 20, 40] as const;

export const MIN_AMOUNT_REAIS = 10;
export const AMOUNT_STEP_REAIS = 5;

export const DEFAULT_LIMIT_DRAFT: LimitDraft = { type: 'FULL', amountReais: 30, energyKwh: 10 };

export function getMaxAmountReais(pricePerKwhCents: number) {
  const max = Math.ceil((MAX_ENERGY_KWH * pricePerKwhCents) / 100 / AMOUNT_STEP_REAIS) * AMOUNT_STEP_REAIS;
  return Math.max(MIN_AMOUNT_REAIS + AMOUNT_STEP_REAIS * 3, max);
}

export function getAmountPresets(maxReais: number) {
  const step = Math.max(
    AMOUNT_STEP_REAIS,
    Math.round((maxReais - MIN_AMOUNT_REAIS) / 3 / AMOUNT_STEP_REAIS) * AMOUNT_STEP_REAIS,
  );
  return [MIN_AMOUNT_REAIS, MIN_AMOUNT_REAIS + step, MIN_AMOUNT_REAIS + step * 2, maxReais];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function clampDraft(draft: LimitDraft, pricePerKwhCents: number): LimitDraft {
  return {
    ...draft,
    amountReais: clamp(draft.amountReais, MIN_AMOUNT_REAIS, getMaxAmountReais(pricePerKwhCents)),
    energyKwh: clamp(draft.energyKwh, MIN_ENERGY_KWH, MAX_ENERGY_KWH),
  };
}

export function toLimitInput(draft: LimitDraft, pricePerKwhCents: number): ChargingLimitInput {
  const clamped = clampDraft(draft, pricePerKwhCents);
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
