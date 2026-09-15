import { render, screen } from '@testing-library/react-native';

import { StatusPill } from '@/components/ui/status-pill';
import { colors } from '@/constants/theme';

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

  it('falls back to the info status', async () => {
    await render(<StatusPill label="Aviso" testID="pill" />);

    expect(screen.getByTestId('pill')).toHaveStyle({ backgroundColor: colors.statusInfoBg });
  });
});
