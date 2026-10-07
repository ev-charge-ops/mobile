import { fireEvent, render, screen, within } from '@testing-library/react-native';

import { ChargePointCard } from '@/features/charging/components/charge-point-card';
import { buildChargePoint } from '@/features/charging/testing/fixtures';

describe('<ChargePointCard />', () => {
  it('highlights the distance to the point', async () => {
    const onPress = jest.fn();
    await render(<ChargePointCard chargePoint={buildChargePoint()} distanceMeters={1_234} onPress={onPress} />);

    const card = screen.getByRole('button', { name: 'Garagem L1 · Vaga 12, Livre, a 1,2 km' });
    expect(within(screen.getByTestId('distance-tag')).getByText('1,2 km')).toBeOnTheScreen();

    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalled();
  });

  it('hides the distance while there is no reference position', async () => {
    await render(<ChargePointCard chargePoint={buildChargePoint()} distanceMeters={null} onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Garagem L1 · Vaga 12, Livre' })).toBeOnTheScreen();
    expect(screen.queryByTestId('distance-tag')).not.toBeOnTheScreen();
  });
});
