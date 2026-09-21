import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as chargingApi from '@/features/charging/api/charging-api';
import { ChargePointScreen } from '@/features/charging/screens/charge-point-screen';
import { buildChargePoint, buildCommercialChargePoint } from '@/features/charging/testing/fixtures';
import { buildSession } from '@/features/charging/testing/session-fixtures';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() } }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, getChargePoint: jest.fn(), startSession: jest.fn(), getActiveSession: jest.fn() };
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

    expect(await screen.findByRole('button', { name: 'Tarifa não configurada' })).toBeDisabled();
    expect(screen.getByText(/O gestor ainda não definiu a tarifa deste ponto/)).toBeOnTheScreen();
  });

  it('shows a not found message', async () => {
    api.getChargePoint.mockRejectedValue(new chargingApi.ChargingApiError(404, null));

    await renderWithProviders(<ChargePointScreen chargePointId="missing" />);

    expect(
      await screen.findByText('Este ponto de recarga não existe ou não está disponível para você.'),
    ).toBeOnTheScreen();
  });

  it('confirms the price and limit before starting the session', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint());
    api.startSession.mockResolvedValue({ ...buildSession({ id: 'session-9' }), paymentSheet: null });

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Iniciar recarga' }));

    expect(screen.getByText('Confirmar recarga')).toBeOnTheScreen();
    expect(screen.getByText('Travado quando a recarga começa')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: '10 kWh' }));
    expect(screen.getByText(`Custo estimado de R$${NBSP}8,90`)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar e iniciar' }));

    expect(api.startSession).toHaveBeenCalledWith({ chargePointId: 'cp-1', limit: { type: 'ENERGY', value: 10 } });
    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/sessions/[sessionId]',
      params: { sessionId: 'session-9' },
    });
  });

  it('explains why the session could not start', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint());
    api.startSession.mockRejectedValue(new chargingApi.ChargingApiError(409, 'CHARGE_POINT_BUSY'));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Iniciar recarga' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar e iniciar' }));

    expect(await screen.findByText('Este ponto acabou de ser ocupado. Escolha outro ponto livre.')).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('opens the open session when the driver already has one', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint());
    api.startSession.mockRejectedValue(new chargingApi.ChargingApiError(409, 'ACTIVE_SESSION_EXISTS'));
    api.getActiveSession.mockResolvedValue(buildSession({ id: 'session-open' }));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Iniciar recarga' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar e iniciar' }));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/sessions/[sessionId]',
        params: { sessionId: 'session-open' },
      }),
    );
  });

  it('does not allow starting at a busy point', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint({ status: 'CHARGING' }));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);

    expect(await screen.findByRole('button', { name: 'Ponto em uso' })).toBeDisabled();
  });

  it('does not start commercial sessions without card payments', async () => {
    api.getChargePoint.mockResolvedValue(buildCommercialChargePoint());

    await renderWithProviders(<ChargePointScreen chargePointId="cp-3" />);

    expect(await screen.findByRole('button', { name: 'Iniciar recarga' })).toBeDisabled();
    expect(screen.getByText('O pagamento com cartão chega na próxima versão do app')).toBeOnTheScreen();
  });
});
