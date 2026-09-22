import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { haptics } from '@/lib/haptics';

jest.mock('@/lib/haptics', () => ({
  haptics: {
    selection: jest.fn(),
    impactLight: jest.fn(),
    impactMedium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

beforeEach(() => jest.clearAllMocks());

describe('haptic presses', () => {
  it('fires a light impact when haptic is true', async () => {
    const onPress = jest.fn();
    await render(
      <PressableScale accessibilityRole="button" accessibilityLabel="Tocar" haptic onPress={onPress}>
        <Text>Tocar</Text>
      </PressableScale>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Tocar' }));

    expect(haptics.impactLight).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires the requested feedback on a button', async () => {
    await render(<Button label="Encerrar" haptic="impactMedium" onPress={jest.fn()} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Encerrar' }));

    expect(haptics.impactMedium).toHaveBeenCalledTimes(1);
    expect(haptics.impactLight).not.toHaveBeenCalled();
  });

  it('stays silent without the haptic prop', async () => {
    await render(<Button label="Voltar" onPress={jest.fn()} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(haptics.impactLight).not.toHaveBeenCalled();
  });
});
