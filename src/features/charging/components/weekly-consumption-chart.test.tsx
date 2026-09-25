import { render, screen } from '@testing-library/react-native';

import { getBarHeight, WeeklyConsumptionChart } from '@/features/charging/components/weekly-consumption-chart';

describe('getBarHeight', () => {
  it('scales the bars to the busiest week with a visible minimum', () => {
    expect(getBarHeight(20, 20)).toBe(68);
    expect(getBarHeight(10, 20)).toBe(34);
    expect(getBarHeight(0.1, 20)).toBe(2);
    expect(getBarHeight(0, 20)).toBe(2);
    expect(getBarHeight(0, 0)).toBe(2);
  });
});

describe('<WeeklyConsumptionChart />', () => {
  it('labels each week with its consumption', async () => {
    await render(
      <WeeklyConsumptionChart
        weeks={[
          { label: 'S1', energyKwh: 11.8 },
          { label: 'S2', energyKwh: 0 },
        ]}
      />,
    );

    expect(screen.getByText('Consumo por semana')).toBeOnTheScreen();
    expect(screen.getByLabelText('Semana 1: 11,8 kWh')).toBeOnTheScreen();
    expect(screen.getByLabelText('Semana 2: sem recargas')).toBeOnTheScreen();
    expect(screen.getByText('—')).toBeOnTheScreen();
  });
});
