import { fireEvent, render, screen } from '@testing-library/react-native';
import { Zap } from 'lucide-react-native';

import { Chip } from '@/components/ui/chip';
import { colors } from '@/constants/theme';

describe('<Chip />', () => {
  it('renders a grey pill when idle', async () => {
    await render(<Chip label="7 kW" icon={Zap} testID="chip" />);

    expect(screen.getByTestId('chip')).toHaveStyle({ backgroundColor: colors.surfaceInset });
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('is a selectable button when pressable', async () => {
    const onPress = jest.fn();
    await render(<Chip label="Livres agora" selected onPress={onPress} />);

    const chip = screen.getByRole('button', { name: 'Livres agora' });
    expect(chip).toBeSelected();
    expect(chip).toHaveStyle({ backgroundColor: colors.accent });

    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
