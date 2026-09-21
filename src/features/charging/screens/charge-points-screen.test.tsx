import { fireEvent, screen, within } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as chargingApi from '@/features/charging/api/charging-api';
import { ChargePointsScreen } from '@/features/charging/screens/charge-points-screen';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, listChargePoints: jest.fn() };
});

const api = jest.mocked(chargingApi);

const NBSP = ' ';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<ChargePointsScreen />', () => {
  it('lists the points with status, power, price and the demand badge', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), buildCommercialChargePoint({ status: 'CHARGING' })]);

    await renderWithProviders(<ChargePointsScreen />);

    const privateCard = await screen.findByRole('button', { name: 'Garagem L1 · Vaga 12, Livre' });
    expect(within(privateCard).getByText(`R$${NBSP}0,89`)).toBeOnTheScreen();
    expect(within(privateCard).getByText('7 kW · Condomínio')).toBeOnTheScreen();
    expect(within(privateCard).getByText('Fora de pico · ×0,80')).toBeOnTheScreen();
    expect(within(privateCard).getByText('Previsão da IA · modelo v1')).toBeOnTheScreen();

    const commercialCard = screen.getByRole('button', { name: 'Garagem L2 · Visitantes, Em uso' });
    expect(within(commercialCard).getByText(`R$${NBSP}2,84`)).toBeOnTheScreen();
    expect(within(commercialCard).getByText('Pico · ×1,50')).toBeOnTheScreen();
    expect(within(commercialCard).getByText('Regra por horário')).toBeOnTheScreen();
  });

  it('filters by regime and availability', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint(), buildCommercialChargePoint({ status: 'CHARGING' })]);

    await renderWithProviders(<ChargePointsScreen />);
    await screen.findByText('Garagem L1 · Vaga 12');

    await fireEvent.press(screen.getByRole('button', { name: 'Comercial' }));
    expect(screen.queryByText('Garagem L1 · Vaga 12')).not.toBeOnTheScreen();
    expect(screen.getByText('Garagem L2 · Visitantes')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Só livres' }));
    expect(screen.getByText('Garagem L1 · Vaga 12')).toBeOnTheScreen();
    expect(screen.queryByText('Garagem L2 · Visitantes')).not.toBeOnTheScreen();
  });

  it('opens the point detail', async () => {
    api.listChargePoints.mockResolvedValue([buildChargePoint()]);

    await renderWithProviders(<ChargePointsScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Garagem L1 · Vaga 12, Livre' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/charge-points/[chargePointId]',
      params: { chargePointId: 'cp-1' },
    });
  });

  it('shows the empty state', async () => {
    api.listChargePoints.mockResolvedValue([]);

    await renderWithProviders(<ChargePointsScreen />);

    expect(await screen.findByText('Nenhum ponto encontrado')).toBeOnTheScreen();
  });

  it('retries after a failure', async () => {
    api.listChargePoints.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([buildChargePoint()]);

    await renderWithProviders(<ChargePointsScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Garagem L1 · Vaga 12')).toBeOnTheScreen();
  });
});
