import { fireEvent, render, screen } from '@testing-library/react-native';
import { Zap } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { colors, nightColors, radii } from '@/constants/theme';

describe('<Button />', () => {
  it('renders the label and handles presses', async () => {
    const onPress = jest.fn();
    await render(<Button label="Iniciar recarga" icon={Zap} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar recarga' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Indisponível" disabled onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Indisponível' });
    await fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('is busy and disabled while loading', async () => {
    const onPress = jest.fn();
    await render(<Button label="Salvando" loading onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Salvando' });
    await fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeBusy();
  });

  it('renders a leading icon element', async () => {
    await render(<Button label="Continuar" leadingIcon={<View testID="leading-icon" />} />);

    expect(screen.getByTestId('leading-icon')).toBeOnTheScreen();
  });

  it('replaces the leading icon with a spinner while loading', async () => {
    await render(<Button label="Continuar" loading leadingIcon={<View testID="leading-icon" />} />);

    expect(screen.queryByTestId('leading-icon')).not.toBeOnTheScreen();
  });

  it('renders the primary variant as an ink pill', async () => {
    await render(<Button label="Iniciar recarga" testID="primary" />);

    expect(screen.getByTestId('primary')).toHaveStyle({ backgroundColor: colors.accent, borderRadius: radii.pill });
  });

  it('renders the danger variant as a critical outline', async () => {
    await render(<Button label="Encerrar" variant="danger" testID="danger" />);

    expect(screen.getByTestId('danger')).toHaveStyle({ borderColor: colors.critical });
    expect(screen.getByText('Encerrar')).toHaveStyle({ color: colors.criticalText });
  });

  it('inverts the primary variant on night screens', async () => {
    await render(<Button label="Iniciar" scheme="night" testID="night" />);

    expect(screen.getByTestId('night')).toHaveStyle({ backgroundColor: nightColors.accent });
    expect(screen.getByText('Iniciar')).toHaveStyle({ color: nightColors.textOnAccent });
  });
});
