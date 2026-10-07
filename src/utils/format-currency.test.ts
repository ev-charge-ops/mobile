import { formatCurrency } from '@/utils/format-currency';

const NBSP = ' ';

describe('formatCurrency', () => {
  it('formats values as BRL using pt-BR conventions', () => {
    expect(formatCurrency(1234.5)).toBe(`R$${NBSP}1.234,50`);
  });

  it('rounds to two decimal places', () => {
    expect(formatCurrency(0.896)).toBe(`R$${NBSP}0,90`);
  });

  it('formats zero and negative values', () => {
    expect(formatCurrency(0)).toBe(`R$${NBSP}0,00`);
    expect(formatCurrency(-12)).toBe(`-R$${NBSP}12,00`);
  });
});
