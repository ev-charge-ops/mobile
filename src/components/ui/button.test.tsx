import { fireEvent, render, screen } from '@testing-library/react-native';
import { Zap } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';

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
});
