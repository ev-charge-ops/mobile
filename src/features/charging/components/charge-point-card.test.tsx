import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChargePointCard } from '@/features/charging/components/charge-point-card';
import { summarizeChargePoint } from '@/features/charging/charge-point-summary';
import { buildChargePoint } from '@/features/charging/testing/fixtures';

describe('<ChargePointCard />', () => {
  it('highlights the distance to the point', async () => {
    const onPress = jest.fn();
    await render(<ChargePointCard chargePoint={summarizeChargePoint(buildChargePoint())} distanceMeters={1_234} onPress={onPress} />);

    const card = screen.getByRole('button', { name: 'Garagem L1 · Vaga 12, Livre, a 1,2 km' });
    expect(screen.getByTestId('distance-tag')).toHaveTextContent('1,2 km');

    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalled();
  });

  it('hides the distance while there is no reference position', async () => {
    await render(<ChargePointCard chargePoint={summarizeChargePoint(buildChargePoint())} distanceMeters={null} onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Garagem L1 · Vaga 12, Livre' })).toBeOnTheScreen();
    expect(screen.queryByTestId('distance-tag')).not.toBeOnTheScreen();
  });

  it('names the connector and flags demo prices of Open Charge Map points', async () => {
    await render(
      <ChargePointCard
        chargePoint={summarizeChargePoint(
          buildChargePoint({
            attribution: 'Dados © Open Charge Map',
            charger: { id: 'ch-9', vendor: 'ABB', serialNumber: 'X', connector: 'CHADEMO' },
          }),
        )}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText('CHAdeMO')).toBeOnTheScreen();
    expect(screen.getByTestId('demo-price-tag')).toHaveTextContent('Preço de demonstração');
  });
});
