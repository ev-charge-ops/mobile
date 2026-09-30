import { render, screen } from '@testing-library/react-native';

import { MetricTile } from '@/components/ui/metric-tile';
import { colors } from '@/constants/theme';

describe('<MetricTile />', () => {
  it('renders a grey tile with label, value and unit', async () => {
    await render(<MetricTile label="Potência" value="6,8" unit="kW" testID="tile" />);

    expect(screen.getByTestId('tile')).toHaveStyle({ backgroundColor: colors.surfaceInset });
    expect(screen.getByText('Potência')).toBeOnTheScreen();
    expect(screen.getByText('6,8')).toBeOnTheScreen();
    expect(screen.getByText('kW')).toBeOnTheScreen();
  });

  it('places the currency before the value', async () => {
    await render(<MetricTile label="Valor" value="11,14" unit="R$" />);

    const texts = screen.getAllByText(/R\$|11,14/).map((node) => node.props.children);
    expect(texts).toEqual(['R$', '11,14']);
  });

  it('drops the background when plain', async () => {
    await render(<MetricTile value="12" plain testID="tile" />);

    expect(screen.getByTestId('tile')).not.toHaveStyle({ backgroundColor: colors.surfaceInset });
  });

  it('colors the value by tone', async () => {
    await render(<MetricTile value="12,4" tone="charging" />);

    expect(screen.getByText('12,4')).toHaveStyle({ color: colors.energyText });
  });
});
