import { screen } from '@testing-library/react-native';

import * as chargingApi from '@/features/charging/api/charging-api';
import { ChargePointScreen } from '@/features/charging/screens/charge-point-screen';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, getChargePoint: jest.fn() };
});

const api = jest.mocked(chargingApi);

const NBSP = ' ';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<ChargePointScreen />', () => {
  it('shows the private point passing the utility rate through', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint());

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);

    expect(await screen.findByText('Garagem L1 · Vaga 12')).toBeOnTheScreen();
    expect(api.getChargePoint).toHaveBeenCalledWith('cp-1');
    expect(screen.getByText('Condomínio · energia a custo')).toBeOnTheScreen();
    expect(screen.getByText('Tarifa da concessionária, sem margem')).toBeOnTheScreen();
    expect(screen.getByText('Fora de pico · ×0,80')).toBeOnTheScreen();
    expect(screen.getByText(`R$${NBSP}0,25/min`)).toBeOnTheScreen();
    expect(screen.getByText('GoodWe HCA G2')).toBeOnTheScreen();
  });

  it('explains the dynamic price of a commercial point', async () => {
    api.getChargePoint.mockResolvedValue(buildCommercialChargePoint());

    await renderWithProviders(<ChargePointScreen chargePointId="cp-3" />);

    expect(await screen.findByText('Rede comercial · tarifa dinâmica')).toBeOnTheScreen();
    expect(screen.getByText(`Tarifa base R$${NBSP}1,89/kWh × fator ×1,50`)).toBeOnTheScreen();
    expect(screen.getByText('Pico · ×1,50')).toBeOnTheScreen();
  });

  it('warns when the tariff is not configured', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint({ pricing: null }));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);

    expect(await screen.findByText('Tarifa não configurada')).toBeOnTheScreen();
  });

  it('shows a not found message', async () => {
    api.getChargePoint.mockRejectedValue(new chargingApi.ChargingApiError(404, null));

    await renderWithProviders(<ChargePointScreen chargePointId="missing" />);

    expect(
      await screen.findByText('Este ponto de recarga não existe ou não está disponível para você.'),
    ).toBeOnTheScreen();
  });
});
