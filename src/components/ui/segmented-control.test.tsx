import { fireEvent, render, screen } from '@testing-library/react-native';

import { SegmentedControl } from '@/components/ui/segmented-control';
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

describe('<SegmentedControl />', () => {
  const options = [
    { value: 'amount', label: 'Por valor' },
    { value: 'energy', label: 'Por energia' },
  ] as const;

  it('changes the value with a selection haptic', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={options} value="amount" onChange={onChange} />);

    expect(screen.getByRole('tab', { name: 'Por valor' })).toBeSelected();
    await fireEvent.press(screen.getByRole('tab', { name: 'Por energia' }));

    expect(onChange).toHaveBeenCalledWith('energy');
    expect(haptics.selection).toHaveBeenCalledTimes(1);
  });

  it('ignores presses on the selected option', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={options} value="amount" onChange={onChange} />);

    await fireEvent.press(screen.getByRole('tab', { name: 'Por valor' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
