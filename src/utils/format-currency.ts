const groupSeparator = /\B(?=(\d{3})+(?!\d))/g;

export function formatCurrency(value: number) {
  const cents = Math.round(Math.abs(value) * 100);
  const integer = String(Math.floor(cents / 100)).replace(groupSeparator, '.');
  const decimals = String(cents % 100).padStart(2, '0');
  return `${value < 0 && cents > 0 ? '-' : ''}R$ ${integer},${decimals}`;
}
