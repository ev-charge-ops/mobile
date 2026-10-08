import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Linking } from 'react-native';

import * as chargingApi from '@/features/charging/api/charging-api';
import * as cardPaymentModule from '@/features/charging/payments/card-payment';
import { ChargePointScreen } from '@/features/charging/screens/charge-point-screen';
import { buildChargePoint, buildCommercialChargePoint, buildQueueEntry } from '@/features/charging/testing/fixtures';
import { buildSession } from '@/features/charging/testing/session-fixtures';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
    useFocusEffect: (effect: () => void | (() => void)) => useEffect(effect, [effect]),
  };
});

jest.mock('expo-status-bar', () => ({ setStatusBarStyle: jest.fn() }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return {
    ...actual,
    getChargePoint: jest.fn(),
    listChargePoints: jest.fn(),
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
  api.listChargePoints.mockResolvedValue([buildChargePoint()]);
});

describe('<ChargePointScreen />', () => {
  it('shows the private point passing the utility rate through', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint());

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);

    expect(await screen.findByText('L1-01 · Vaga 12')).toBeOnTheScreen();
    expect(api.getChargePoint).toHaveBeenCalledWith('cp-1');
    expect(screen.getByText('Garagem L1 · Residencial Aclimação')).toBeOnTheScreen();
    expect(screen.getByText('Disponível agora')).toBeOnTheScreen();
    expect(screen.getAllByText(`R$${NBSP}0,89/kWh`)).toHaveLength(2);
    expect(screen.getByText('7 kW')).toBeOnTheScreen();
    expect(await screen.findByText('10 m')).toBeOnTheScreen();
    expect(screen.getByText('Grupo A · rateio no condomínio')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Energia repassada a custo, sem margem (ANEEL RN 1.000/2021). Tolerância de 10 min após a carga completa.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText('Tarifa da concessionária, sem margem')).toBeOnTheScreen();
    expect(screen.getByText('Fora de pico · ×0,80')).toBeOnTheScreen();
    expect(screen.getByText(`R$${NBSP}0,25/min`)).toBeOnTheScreen();
    expect(screen.getByText('GoodWe HCA G2')).toBeOnTheScreen();
    expect(screen.getByTestId('charge-point-photo-fallback')).toBeOnTheScreen();
  });

  it('shows the photo of the point when there is one', async () => {
    api.getChargePoint.mockResolvedValue(
      buildChargePoint({ photoUrl: 'https://app.evchargeops.com.br/media/points/garage-a.webp' }),
    );

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);

    expect(await screen.findByTestId('charge-point-photo')).toBeOnTheScreen();
    expect(screen.queryByTestId('charge-point-photo-fallback')).not.toBeOnTheScreen();
  });

  it('opens the directions to the point in the maps app', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    api.getChargePoint.mockResolvedValue(buildChargePoint());

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Como chegar' }));

    expect(openURL).toHaveBeenCalledWith(expect.stringContaining('-23.56905,-46.63145'));
  });

  it('goes back to the map from the back button', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint());

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Voltar ao mapa' }));

    expect(router.back).toHaveBeenCalled();
  });

  it('explains the dynamic price of a commercial point', async () => {
    api.getChargePoint.mockResolvedValue(buildCommercialChargePoint());

    await renderWithProviders(<ChargePointScreen chargePointId="cp-3" />);

    expect(await screen.findByText('Rede comercial · cobrança no cartão')).toBeOnTheScreen();
    expect(screen.getByText(/Tarifa base de R\$\s1,89\/kWh × fator de demanda/)).toBeOnTheScreen();
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

    expect(screen.getByText('Tarifa travada no início')).toBeOnTheScreen();
    expect(screen.getByText('Limitar por')).toBeOnTheScreen();
    expect(screen.getByText('Iniciar recarga · L1-01')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('tab', { name: 'kWh' }));
    await fireEvent.press(screen.getByRole('button', { name: '10 kWh' }));
    expect(screen.getByText(`≈ R$${NBSP}8,90 · até 62% · pronta em cerca de 1 h 25 min`)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Conectar e iniciar' }));

    expect(api.startSession).toHaveBeenCalledWith({ chargePointId: 'cp-1', limit: { type: 'ENERGY', value: 10 } });
    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/sessions/[sessionId]',
      params: { sessionId: 'session-9' },
    });
  });

  it('starts with a percent limit by default', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint());
    api.startSession.mockResolvedValue({ ...buildSession({ id: 'session-9' }), paymentSheet: null });

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Iniciar recarga' }));
    await fireEvent.press(screen.getByRole('button', { name: '90%' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Conectar e iniciar' }));

    expect(api.startSession).toHaveBeenCalledWith({ chargePointId: 'cp-1', limit: { type: 'PERCENT', value: 90 } });
  });

  it('explains a percent limit below the current charge', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint());
    api.startSession.mockRejectedValue(new chargingApi.ChargingApiError(400, 'INVALID_LIMIT'));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Iniciar recarga' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Conectar e iniciar' }));

    expect(
      await screen.findByText(/O limite escolhido não é válido\. Em %, ele precisa ficar acima da carga atual/),
    ).toBeOnTheScreen();
  });

  it('explains why the session could not start', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint());
    api.startSession.mockRejectedValue(new chargingApi.ChargingApiError(409, 'CHARGE_POINT_BUSY'));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Iniciar recarga' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Conectar e iniciar' }));

    expect(await screen.findByText('Este ponto acabou de ser ocupado. Escolha outro ponto livre.')).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('opens the open session when the driver already has one', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint());
    api.startSession.mockRejectedValue(new chargingApi.ChargingApiError(409, 'ACTIVE_SESSION_EXISTS'));
    api.getActiveSession.mockResolvedValue(buildSession({ id: 'session-open' }));

    await renderWithProviders(<ChargePointScreen chargePointId="cp-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Iniciar recarga' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Conectar e iniciar' }));

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
    expect(screen.getByText(/com pré-autorização no cartão/)).toBeOnTheScreen();
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
