import { render, screen } from '@testing-library/react-native';

import { StatusPill } from '@/components/ui/status-pill';
import { colors, nightColors } from '@/constants/theme';

describe('<StatusPill />', () => {
  it('renders the label', async () => {
    await render(<StatusPill status="charging" label="Carregando" />);

    expect(screen.getByText('Carregando')).toBeOnTheScreen();
  });

  it.each([
    ['charging', colors.statusCharging, colors.statusChargingBg],
    ['fault', colors.statusFault, colors.statusFaultBg],
    ['offline', colors.statusOffline, colors.statusOfflineBg],
  ] as const)('applies the %s colors', async (status, color, backgroundColor) => {
    await render(<StatusPill status={status} label="Status" testID="pill" />);

    expect(screen.getByTestId('pill')).toHaveStyle({ backgroundColor });
    expect(screen.getByText('Status')).toHaveStyle({ color });
  });

  it('pulses the dot only while charging by default', async () => {
    const { rerender } = await render(<StatusPill status="charging" label="Carregando" />);
    expect(screen.getByTestId('status-dot-live')).toBeOnTheScreen();

    await rerender(<StatusPill status="available" label="Livre" />);
    expect(screen.queryByTestId('status-dot-live')).not.toBeOnTheScreen();
    expect(screen.getByTestId('status-dot')).toHaveStyle({ backgroundColor: colors.energy });
  });

  it('uses night tokens for the night scheme', async () => {
    await render(<StatusPill status="charging" label="Carregando" scheme="night" testID="pill" />);

    expect(screen.getByTestId('pill')).toHaveStyle({ backgroundColor: nightColors.statusChargingBg });
  });

  it('falls back to the info status', async () => {
    await render(<StatusPill label="Aviso" testID="pill" />);

    expect(screen.getByTestId('pill')).toHaveStyle({ backgroundColor: colors.statusInfoBg });
  });
});
