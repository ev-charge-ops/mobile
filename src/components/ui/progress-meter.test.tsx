import { render, screen } from '@testing-library/react-native';

import { getMeterRatio, ProgressMeter } from '@/components/ui/progress-meter';
import { colors } from '@/constants/theme';

describe('<ProgressMeter />', () => {
  it('computes a safe ratio', () => {
    expect(getMeterRatio(5, 10)).toBe(0.5);
    expect(getMeterRatio(20, 10)).toBe(1);
    expect(getMeterRatio(5, 0)).toBe(0);
  });

  it('keeps the original api', async () => {
    await render(<ProgressMeter value={64} caption="Bateria" valueLabel="64 %" />);

    expect(screen.getByRole('progressbar', { name: 'Bateria' })).toHaveAccessibilityValue({ now: 64 });
    expect(screen.getByText('64 %')).toBeOnTheScreen();
    expect(screen.queryAllByTestId('progress-meter-gap')).toHaveLength(0);
    expect(screen.queryByTestId('progress-meter-threshold')).not.toBeOnTheScreen();
  });

  it('draws segment gaps', async () => {
    await render(<ProgressMeter value={30} segmented />);
    expect(screen.getAllByTestId('progress-meter-gap')).toHaveLength(9);
  });

  it('turns red past the threshold', async () => {
    await render(<ProgressMeter value={80} threshold={70} tone="demand" valueLabel="80 %" />);

    expect(screen.getByTestId('progress-meter-threshold')).toHaveStyle({ left: '70%' });
    expect(screen.getByTestId('progress-meter-fill')).toHaveStyle({ backgroundColor: colors.meterOver });
    expect(screen.getByText('80 %')).toHaveStyle({ color: colors.meterOver });
  });

  it('draws the limit marker and the flow stripes', async () => {
    await render(<ProgressMeter value={68} limit={80} flow />);

    expect(screen.getByTestId('progress-meter-limit')).toHaveStyle({ left: '80%', backgroundColor: colors.meterLimit });
    expect(screen.getByTestId('progress-meter-flow')).toBeOnTheScreen();
  });

  it('omits the flow stripes by default', async () => {
    await render(<ProgressMeter value={68} />);

    expect(screen.queryByTestId('progress-meter-flow')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('progress-meter-limit')).not.toBeOnTheScreen();
  });
});
