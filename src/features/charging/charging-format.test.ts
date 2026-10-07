import {
  formatCents,
  formatDemandFactor,
  formatDemandSource,
  formatPower,
  formatPricePerKwh,
} from '@/features/charging/charging-format';

const NBSP = ' ';

describe('charging format', () => {
  it('formats cents as BRL', () => {
    expect(formatCents(1278)).toBe(`R$${NBSP}12,78`);
  });

  it('formats the price per kWh', () => {
    expect(formatPricePerKwh(151)).toBe(`R$${NBSP}1,51/kWh`);
  });

  it('formats power with up to one decimal', () => {
    expect(formatPower(7)).toBe('7 kW');
    expect(formatPower(7.44)).toBe('7,4 kW');
  });

  it('formats the demand factor as a multiplier', () => {
    expect(formatDemandFactor(0.8)).toBe('×0,80');
  });

  it('describes where the demand factor came from', () => {
    expect(formatDemandSource('MODEL', 'v1')).toBe('Previsão da IA · modelo v1');
    expect(formatDemandSource('MODEL', null)).toBe('Previsão da IA');
    expect(formatDemandSource('RULE', null)).toBe('Regra por horário');
  });
});
