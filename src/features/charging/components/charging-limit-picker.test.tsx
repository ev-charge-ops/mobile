import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';

import { DEFAULT_LIMIT_DRAFT, type LimitDraft } from '@/features/charging/charging-limit';
import { ChargingLimitPicker } from '@/features/charging/components/charging-limit-picker';
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

const NBSP = ' ';

const changes: LimitDraft[] = [];

function Harness({ initial = DEFAULT_LIMIT_DRAFT }: { initial?: LimitDraft }) {
  const [value, setValue] = useState(initial);
  return (
    <ChargingLimitPicker
      value={value}
      pricePerKwhCents={89}
      onChange={(next) => {
        changes.push(next);
        setValue(next);
      }}
    />
  );
}

function slide(actionName: 'increment' | 'decrement') {
  return fireEvent(screen.getByTestId('limit-slider'), 'accessibilityAction', { nativeEvent: { actionName } });
}

beforeEach(() => {
  jest.clearAllMocks();
  changes.length = 0;
});

describe('<ChargingLimitPicker />', () => {
  it('starts at 80% with the energy and cost it takes', async () => {
    await render(<Harness />);

    expect(screen.getByRole('tab', { name: '%' })).toBeSelected();
    expect(screen.getByTestId('limit-value')).toHaveTextContent('80');
    expect(screen.getByText(`≈ 19,0 kWh · R$${NBSP}16,91`)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '80%' })).toBeSelected();
    expect(screen.getByText(/bateria de 50 kWh com 42% de carga/)).toBeOnTheScreen();
  });

  it('steps the limit with the round buttons and the slider', async () => {
    await render(<Harness />);

    await fireEvent.press(screen.getByRole('button', { name: 'Aumentar limite' }));
    expect(changes.at(-1)).toMatchObject({ type: 'PERCENT', socPercent: 85 });

    await fireEvent.press(screen.getByRole('button', { name: 'Diminuir limite' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Diminuir limite' }));
    expect(changes.at(-1)).toMatchObject({ type: 'PERCENT', socPercent: 75 });

    await slide('decrement');
    expect(changes.at(-1)).toMatchObject({ type: 'PERCENT', socPercent: 70 });
    expect(screen.getByTestId('limit-slider')).toHaveAccessibilityValue({ min: 50, max: 100, now: 70 });
    expect(haptics.selection).toHaveBeenCalled();
  });

  it('switches to energy and shows the cost and charge it reaches', async () => {
    await render(<Harness />);

    await fireEvent.press(screen.getByRole('tab', { name: 'kWh' }));
    await fireEvent.press(screen.getByRole('button', { name: '20 kWh' }));

    expect(changes.at(-1)).toMatchObject({ type: 'ENERGY', energyKwh: 20 });
    expect(screen.getByTestId('limit-value')).toHaveTextContent('20');
    expect(screen.getByText(`≈ R$${NBSP}17,80 · até 82%`)).toBeOnTheScreen();
  });

  it('limits by amount', async () => {
    await render(<Harness />);

    await fireEvent.press(screen.getByRole('tab', { name: 'R$' }));
    await fireEvent.press(screen.getByRole('button', { name: 'R$ 25' }));
    await slide('increment');

    expect(changes.at(-1)).toMatchObject({ type: 'AMOUNT', amountReais: 30 });
    expect(screen.getByTestId('limit-value')).toHaveTextContent('30');
    expect(screen.getByText('≈ 29,0 kWh · até 100%')).toBeOnTheScreen();
  });

  it('charges until full and leaves it from the buttons', async () => {
    await render(<Harness />);

    await fireEvent.press(screen.getByRole('button', { name: 'Até encher' }));
    expect(changes.at(-1)).toMatchObject({ type: 'FULL' });
    expect(screen.getByTestId('limit-value')).toHaveTextContent('Até encher');
    expect(screen.getByText(`≈ 29,0 kWh · R$${NBSP}25,81`)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Diminuir limite' }));
    expect(changes.at(-1)).toMatchObject({ type: 'PERCENT', socPercent: 95 });
  });
});
