import {
  amountToEnergyKwh,
  clampDraft,
  DEFAULT_LIMIT_DRAFT,
  energyToAmountCents,
  energyToSocPercent,
  estimateLimit,
  getAmountPresets,
  getMaxAmountReais,
  MAX_ENERGY_KWH,
  setModeValue,
  socToEnergyKwh,
  stepDraft,
  toLimitInput,
  type LimitDraft,
} from '@/features/charging/charging-limit';

const energyDraft: LimitDraft = { ...DEFAULT_LIMIT_DRAFT, type: 'ENERGY', mode: 'ENERGY', energyKwh: 20 };
const amountDraft: LimitDraft = { ...DEFAULT_LIMIT_DRAFT, type: 'AMOUNT', mode: 'AMOUNT', amountReais: 25 };

describe('charging limit', () => {
  it('starts at 80% of the battery', () => {
    expect(DEFAULT_LIMIT_DRAFT).toMatchObject({ type: 'PERCENT', socPercent: 80 });
  });

  it('caps the amount at the energy covered by the card hold', () => {
    expect(getMaxAmountReais(89)).toBe(55);
    expect(getMaxAmountReais(189)).toBe(115);
    expect(getMaxAmountReais(10)).toBe(25);
  });

  it('spreads three amount presets below the maximum', () => {
    expect(getAmountPresets(55)).toEqual([10, 25, 40]);
    expect(getAmountPresets(115)).toEqual([10, 45, 80]);
  });

  it('keeps the draft inside the allowed range', () => {
    const clamped = clampDraft({ ...energyDraft, amountReais: 500, energyKwh: 0, socPercent: 30 }, 89);

    expect(clamped.amountReais).toBe(55);
    expect(clamped.energyKwh).toBe(2);
    expect(clamped.socPercent).toBe(50);
  });

  it('maps the draft to the api limit', () => {
    expect(toLimitInput(DEFAULT_LIMIT_DRAFT, 89)).toEqual({ type: 'PERCENT', value: 80 });
    expect(toLimitInput({ ...DEFAULT_LIMIT_DRAFT, type: 'FULL' }, 89)).toEqual({ type: 'FULL' });
    expect(toLimitInput(energyDraft, 89)).toEqual({ type: 'ENERGY', value: 20 });
    expect(toLimitInput(amountDraft, 89)).toEqual({ type: 'AMOUNT', value: 2500 });
    expect(toLimitInput({ ...energyDraft, energyKwh: 999 }, 89)).toEqual({ type: 'ENERGY', value: MAX_ENERGY_KWH });
  });

  it('steps the value of the current mode and leaves the full charge', () => {
    expect(stepDraft(DEFAULT_LIMIT_DRAFT, 1, 89)).toMatchObject({ type: 'PERCENT', socPercent: 85 });
    expect(stepDraft({ ...DEFAULT_LIMIT_DRAFT, socPercent: 100 }, 1, 89)).toMatchObject({ socPercent: 100 });
    expect(stepDraft(energyDraft, -1, 89)).toMatchObject({ type: 'ENERGY', energyKwh: 19 });
    expect(stepDraft({ ...DEFAULT_LIMIT_DRAFT, type: 'FULL' }, -1, 89)).toMatchObject({
      type: 'PERCENT',
      socPercent: 95,
    });
    expect(setModeValue(amountDraft, 40)).toMatchObject({ type: 'AMOUNT', amountReais: 40 });
  });

  it('converts between money and energy with the locked price', () => {
    expect(amountToEnergyKwh(89, 89)).toBe(100);
    expect(amountToEnergyKwh(10, 0)).toBe(0);
    expect(energyToAmountCents(10, 89)).toBe(890);
  });

  it('estimates the energy of a state of charge on the reference battery', () => {
    expect(socToEnergyKwh(80)).toBeCloseTo(19);
    expect(socToEnergyKwh(30)).toBe(0);
    expect(energyToSocPercent(19)).toBe(80);
    expect(energyToSocPercent(100)).toBe(100);
  });

  it('estimates energy, cost and charge of every limit', () => {
    expect(estimateLimit(DEFAULT_LIMIT_DRAFT, 89)).toEqual({ energyKwh: 19, amountCents: 1691, socPercent: 80 });
    expect(estimateLimit(energyDraft, 89)).toEqual({ energyKwh: 20, amountCents: 1780, socPercent: 82 });
    expect(estimateLimit({ ...DEFAULT_LIMIT_DRAFT, type: 'FULL' }, 89)).toMatchObject({ socPercent: 100 });
  });
});
