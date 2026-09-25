import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as chargingApi from '@/features/charging/api/charging-api';
import * as cardPaymentModule from '@/features/charging/payments/card-payment';
import { ChargePointScreen } from '@/features/charging/screens/charge-point-screen';
import { buildChargePoint, buildCommercialChargePoint, buildQueueEntry } from '@/features/charging/testing/fixtures';
import { buildSession } from '@/features/charging/testing/session-fixtures';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() } }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return {
    ...actual,
    getChargePoint: jest.fn(),
    startSession: jest.fn(),
    getActiveSession: jest.fn(),
    createSessionPaymentSheet: jest.fn(),
    confirmSessionPayment: jest.fn(),
    joinQueue: jest.fn(),
    leaveQueue: jest.fn(),
  };
});

jest.mock('@/features/charging/payments/card-payment', () => {
  const actual = jest.requireActual('@/features/charging/payments/card-payment');
  return { ...actual, presentCardPayment: jest.fn() };
});

const cardPayment = jest.mocked(cardPaymentModule);

const sheetFixture = {
  paymentIntentClientSecret: 'pi_1_secret',
  customerId: 'cus_1',
  customerEphemeralKeySecret: 'ek_test_1',
  publishableKey: null,
  merchantDisplayName: 'EV ChargeOps',
};

const paymentFixture = {
  paymentIntentId: 'pi_1',
  status: 'PENDING_AUTHORIZATION' as const,
  currency: 'BRL',
  authorizedCents: 20040,
  capturedCents: null,
  failureCode: null,
  authorizedAt: null,
  capturedAt: null,
  canceledAt: null,
};

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
    expect(screen.getByTestId('charge-point-hero-glow')).toBeOnTheScreen();
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
    expect(screen.getByText('Até encher')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Definir um limite' }));
    await fireEvent.press(screen.getByRole('tab', { name: 'Por energia' }));
    await fireEvent.press(screen.getByRole('button', { name: '10 kWh' }));
    expect(screen.getByText(`≈ R$${NBSP}8,90`)).toBeOnTheScreen();
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

  it('offers the queue at a busy point', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint({ status: 'CHARGING', queueLength: 2 }));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);

    expect(await screen.findByRole('button', { name: 'Entrar na fila' })).toBeEnabled();
    expect(screen.getByText('2 na fila agora · reserva de 10 min quando liberar')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Ponto em uso' })).toBeNull();
  });

  it('keeps an offline point disabled without a queue', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint({ status: 'OFFLINE' }));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);

    expect(await screen.findByRole('button', { name: 'Carregador offline' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Entrar na fila' })).toBeNull();
  });

  it('joins the queue from the confirmation sheet', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint({ status: 'IDLE', queueLength: 1 }));
    api.joinQueue.mockResolvedValue(buildQueueEntry({ position: 2, queueLength: 2 }));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Entrar na fila' }));

    expect(screen.getByText(/Você fica em 2º lugar/)).toBeOnTheScreen();
    expect(screen.getByText('Reserva quando liberar')).toBeOnTheScreen();

    api.getChargePoint.mockResolvedValue(
      buildChargePoint({ status: 'IDLE', queueLength: 2, myQueueEntry: buildQueueEntry({ position: 2, queueLength: 2 }) }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar lugar na fila' }));

    await waitFor(() => expect(api.joinQueue).toHaveBeenCalledWith('cp-1'));
    expect(await screen.findByText('Você está 2º na fila deste ponto.')).toBeOnTheScreen();
    expect(await screen.findByRole('button', { name: 'Sair da fila' })).toBeOnTheScreen();
  });

  it('explains a queue conflict in portuguese', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint({ status: 'CHARGING' }));
    api.joinQueue.mockRejectedValue(new chargingApi.ChargingApiError(409, 'ACTIVE_QUEUE_EXISTS'));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Entrar na fila' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar lugar na fila' }));

    expect(
      await screen.findByText('Você já está na fila de outro ponto. Saia dela para entrar nesta.'),
    ).toBeOnTheScreen();
  });

  it('shows the position and leaves the queue', async () => {
    api.getChargePoint.mockResolvedValue(
      buildChargePoint({ status: 'CHARGING', queueLength: 3, myQueueEntry: buildQueueEntry({ position: 2, queueLength: 3 }) }),
    );
    api.leaveQueue.mockResolvedValue(undefined);

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);

    expect(await screen.findByText('Você é o 2º da fila')).toBeOnTheScreen();
    api.getChargePoint.mockResolvedValue(buildChargePoint({ status: 'CHARGING', queueLength: 2 }));
    await fireEvent.press(screen.getByRole('button', { name: 'Sair da fila' }));

    await waitFor(() => expect(api.leaveQueue).toHaveBeenCalledWith('cp-1'));
    expect(await screen.findByText('Você saiu da fila deste ponto.')).toBeOnTheScreen();
    expect(await screen.findByRole('button', { name: 'Entrar na fila' })).toBeOnTheScreen();
  });

  it('shows the reservation countdown and lets the next in line start', async () => {
    const reservedUntil = new Date(Date.now() + 9 * 60_000 + 30_000).toISOString();
    api.getChargePoint.mockResolvedValue(
      buildChargePoint({
        status: 'AVAILABLE',
        reservedUntil,
        queueLength: 1,
        myQueueEntry: buildQueueEntry({ status: 'NOTIFIED', position: 1, queueLength: 1, reservedUntil }),
      }),
    );

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);

    expect(await screen.findByText('Reservado para você')).toBeOnTheScreen();
    expect(screen.getByText(/reservado por mais 09:(30|29)/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Iniciar recarga' })).toBeEnabled();
  });

  it('blocks a point reserved for someone else', async () => {
    api.getChargePoint.mockResolvedValue(
      buildChargePoint({ status: 'AVAILABLE', queueLength: 1, reservedUntil: new Date(Date.now() + 60_000).toISOString() }),
    );

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);

    expect(await screen.findByRole('button', { name: 'Reservado para a fila' })).toBeDisabled();
  });

  it('takes the card pre-authorization before charging at a commercial point', async () => {
    api.getChargePoint.mockResolvedValue(buildCommercialChargePoint());
    api.startSession.mockResolvedValue({
      ...buildSession({ id: 'session-5', status: 'AWAITING_PAYMENT', regime: 'COMMERCIAL', payment: paymentFixture }),
      paymentSheet: sheetFixture,
    });
    cardPayment.presentCardPayment.mockResolvedValue('completed');
    api.confirmSessionPayment.mockResolvedValue(buildSession({ id: 'session-5', status: 'PENDING' }));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-3" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Iniciar recarga' }));
    expect(screen.getByText('Pré-autorização')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar para pagamento' }));

    await waitFor(() => expect(api.confirmSessionPayment).toHaveBeenCalledWith('session-5'));
    expect(cardPayment.presentCardPayment).toHaveBeenCalledWith(sheetFixture);
    expect(api.createSessionPaymentSheet).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/sessions/[sessionId]',
      params: { sessionId: 'session-5' },
    });
  });

  it('keeps the session awaiting payment when the driver closes the payment sheet', async () => {
    api.getChargePoint.mockResolvedValue(buildCommercialChargePoint());
    api.startSession.mockResolvedValue({
      ...buildSession({ id: 'session-5', status: 'AWAITING_PAYMENT', regime: 'COMMERCIAL', payment: paymentFixture }),
      paymentSheet: sheetFixture,
    });
    cardPayment.presentCardPayment.mockResolvedValue('canceled');

    await renderWithProviders(<ChargePointScreen chargePointId="cp-3" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Iniciar recarga' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar para pagamento' }));

    await waitFor(() => expect(cardPayment.presentCardPayment).toHaveBeenCalled());
    expect(api.confirmSessionPayment).not.toHaveBeenCalled();
  });
});
