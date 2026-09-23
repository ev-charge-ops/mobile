import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { clampProgress, Ring } from '@/components/ui/ring';
import { colors } from '@/constants/theme';

describe('<Ring />', () => {
  it('clamps progress between 0 and 1', () => {
    expect(clampProgress(-1)).toBe(0);
    expect(clampProgress(0.4)).toBe(0.4);
    expect(clampProgress(3)).toBe(1);
    expect(clampProgress(Number.NaN)).toBe(0);
  });

  it('exposes progress and renders its children', async () => {
    await render(
      <Ring progress={0.42} accessibilityLabel="Energia">
        <Text>12,4</Text>
      </Ring>,
    );

    expect(screen.getByRole('progressbar', { name: 'Energia' })).toHaveAccessibilityValue({ now: 42 });
    expect(screen.getByText('12,4')).toBeOnTheScreen();
  });

  it('renders the glow only when requested', async () => {
    const { rerender } = await render(<Ring progress={0.5} testID="ring" />);
    expect(screen.queryByTestId('ring-glow')).not.toBeOnTheScreen();

    await rerender(<Ring progress={0.5} testID="ring" glow tone="fault" />);
    expect(screen.getByTestId('ring-glow')).toHaveStyle({ backgroundColor: colors.statusFault });
  });
});
