import { formatEnergy } from '@/utils/format-energy';

describe('formatEnergy', () => {
  it('formats kWh with two decimals by default', () => {
    expect(formatEnergy(18.5)).toBe('18,50 kWh');
  });

  it('uses pt-BR thousand separators', () => {
    expect(formatEnergy(1234.567)).toBe('1.234,57 kWh');
  });

  it('accepts custom fraction digits', () => {
    expect(formatEnergy(29, { fractionDigits: 1 })).toBe('29,0 kWh');
  });

  it('can omit the unit', () => {
    expect(formatEnergy(4.5, { withUnit: false })).toBe('4,50');
  });
});
