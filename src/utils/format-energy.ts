type FormatEnergyOptions = {
  fractionDigits?: number;
  withUnit?: boolean;
};

export function formatEnergy(kwh: number, { fractionDigits = 2, withUnit = true }: FormatEnergyOptions = {}) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(kwh);

  return withUnit ? `${formatted} kWh` : formatted;
}
