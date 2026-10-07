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

beforeEach(() => {
  jest.clearAllMocks();
  changes.length = 0;
});

describe('<ChargingLimitPicker />', () => {
  it('starts without a limit and lets the driver define one', async () => {
    await render(<Harness />);

    expect(screen.getByText('Até encher')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Definir um limite' }));

    expect(screen.getByRole('tab', { name: 'Por valor' })).toBeSelected();
    expect(screen.getByText('30,00')).toBeOnTheScreen();
    expect(screen.getByText('≈ 33,7 kWh')).toBeOnTheScreen();
    expect(screen.getByText(`a R$${NBSP}0,89 por kWh`)).toBeOnTheScreen();
  });

  it('picks presets with a selection haptic', async () => {
    await render(<Harness initial={{ ...DEFAULT_LIMIT_DRAFT, type: 'AMOUNT' }} />);

    await fireEvent.press(screen.getByRole('button', { name: 'R$ 40' }));

    expect(changes.at(-1)).toMatchObject({ type: 'AMOUNT', amountReais: 40 });
    expect(screen.getByRole('button', { name: 'R$ 40' })).toBeSelected();
    expect(haptics.selection).toHaveBeenCalled();
  });

  it('switches to energy and follows the slider', async () => {
    await render(<Harness initial={{ ...DEFAULT_LIMIT_DRAFT, type: 'AMOUNT' }} />);

    await fireEvent.press(screen.getByRole('tab', { name: 'Por energia' }));
    await fireEvent(screen.getByTestId('limit-slider'), 'valueChange', 24);

    expect(changes.at(-1)).toMatchObject({ type: 'ENERGY', energyKwh: 24 });
    expect(screen.getByText('24,0')).toBeOnTheScreen();
    expect(screen.getByText(`≈ R$${NBSP}21,36`)).toBeOnTheScreen();
  });

  it('removes the limit', async () => {
    await render(<Harness initial={{ ...DEFAULT_LIMIT_DRAFT, type: 'ENERGY' }} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Remover' }));

    expect(changes.at(-1)).toMatchObject({ type: 'FULL' });
    expect(screen.getByText('Até encher')).toBeOnTheScreen();
  });
});
