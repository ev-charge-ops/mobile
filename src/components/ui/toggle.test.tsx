import { fireEvent, render, screen } from '@testing-library/react-native';

import { Toggle } from '@/components/ui/toggle';

describe('<Toggle />', () => {
  it('toggles the checked state', async () => {
    const onChange = jest.fn();
    await render(<Toggle checked={false} onChange={onChange} accessibilityLabel="Notificações" />);

    const toggle = screen.getByRole('switch', { name: 'Notificações' });
    expect(toggle).not.toBeChecked();
    await fireEvent.press(toggle);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does nothing when disabled', async () => {
    const onChange = jest.fn();
    await render(<Toggle checked disabled onChange={onChange} accessibilityLabel="Travado" />);

    await fireEvent.press(screen.getByRole('switch', { name: 'Travado' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
