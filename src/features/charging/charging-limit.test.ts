import {
  amountToEnergyKwh,
  clampDraft,
  DEFAULT_LIMIT_DRAFT,
  energyToAmountCents,
  getAmountPresets,
  getMaxAmountReais,
  MAX_ENERGY_KWH,
  toLimitInput,
} from '@/features/charging/charging-limit';

describe('charging limit', () => {
  it('caps the amount at the energy covered by the card hold', () => {
    expect(getMaxAmountReais(89)).toBe(55);
    expect(getMaxAmountReais(189)).toBe(115);
    expect(getMaxAmountReais(10)).toBe(25);
  });

  it('spreads four amount presets up to the maximum', () => {
    expect(getAmountPresets(55)).toEqual([10, 25, 40, 55]);
    expect(getAmountPresets(115)).toEqual([10, 45, 80, 115]);
  });

  it('keeps the draft inside the allowed range', () => {
    const clamped = clampDraft({ type: 'ENERGY', amountReais: 500, energyKwh: 0 }, 89);

    expect(clamped.amountReais).toBe(55);
    expect(clamped.energyKwh).toBe(2);
  });

  it('maps the draft to the api limit', () => {
    expect(toLimitInput(DEFAULT_LIMIT_DRAFT, 89)).toEqual({ type: 'FULL' });
    expect(toLimitInput({ type: 'ENERGY', amountReais: 30, energyKwh: 20 }, 89)).toEqual({ type: 'ENERGY', value: 20 });
    expect(toLimitInput({ type: 'AMOUNT', amountReais: 25, energyKwh: 10 }, 89)).toEqual({ type: 'AMOUNT', value: 2500 });
    expect(toLimitInput({ type: 'ENERGY', amountReais: 30, energyKwh: 999 }, 89)).toEqual({
      type: 'ENERGY',
      value: MAX_ENERGY_KWH,
    });
  });

  it('converts between money and energy with the locked price', () => {
    expect(amountToEnergyKwh(89, 89)).toBe(100);
    expect(amountToEnergyKwh(10, 0)).toBe(0);
    expect(energyToAmountCents(10, 89)).toBe(890);
  });
});
