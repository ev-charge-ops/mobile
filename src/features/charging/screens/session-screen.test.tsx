import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import * as StatusBar from 'expo-status-bar';
import { Share } from 'react-native';

import * as chargingApi from '@/features/charging/api/charging-api';
import * as cardPaymentModule from '@/features/charging/payments/card-payment';
import { SessionScreen } from '@/features/charging/screens/session-screen';
import { buildChargePoint } from '@/features/charging/testing/fixtures';
import { buildClosedSession, buildSession } from '@/features/charging/testing/session-fixtures';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    router: { back: jest.fn(), replace: jest.fn(), dismissTo: jest.fn(), canGoBack: jest.fn(() => true) },
    useFocusEffect: (effect: () => void | (() => void)) => useEffect(effect, [effect]),
    useIsFocused: () => true,
  };
});

jest.mock('expo-status-bar', () => ({ setStatusBarStyle: jest.fn() }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return {
    ...actual,
    getSession: jest.fn(),
    getChargePoint: jest.fn(),
    stopSession: jest.fn(),
    createSessionPaymentSheet: jest.fn(),
    confirmSessionPayment: jest.fn(),
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

const secondsAgo = (seconds: number) => new Date(Date.now() - seconds * 1000).toISOString();
const secondsAhead = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<SessionScreen />', () => {
  it('shows the live energy, power and running cost in the night view', async () => {
    api.getSession.mockResolvedValue(buildSession({ startedAt: secondsAgo(17) }));

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByRole('header', { name: 'L1-01 · Vaga 12' })).toBeOnTheScreen();
    expect(screen.getByText(/^Garagem L1 · início \d\d:\d\d$/)).toBeOnTheScreen();
    expect(screen.getByText('Carregando')).toBeOnTheScreen();
    expect(screen.getByText(/^leitura há \d+ s$/)).toBeOnTheScreen();
    expect(screen.getByTestId('live-energy')).toHaveTextContent('1,48');
    expect(screen.getByText('Potência')).toBeOnTheScreen();
    expect(screen.getByText('17')).toBeOnTheScreen();
    expect(screen.getByText('1,32')).toBeOnTheScreen();
    expect(screen.getByText(/^Tarifa travada às \d\d:\d\d · R\$\s0,89\/kWh, repassada a custo$/)).toBeOnTheScreen();
    expect(screen.getByText('Simulação acelerada · 60×')).toBeOnTheScreen();
    expect(screen.getByTestId('car-top-video')).toBeOnTheScreen();
    expect(StatusBar.setStatusBarStyle).toHaveBeenCalledWith('light', true);
    expect(api.getSession).toHaveBeenCalledWith('session-1');
  });

  it('shows the charge, the limit and when it is reached', async () => {
    api.getSession.mockResolvedValue(
      buildSession({
        socPercent: 68,
        limit: { type: 'PERCENT', energyKwh: null, amountCents: null, socPercent: 80 },
        projectedChargingEndsAt: secondsAhead(42 * 60 + 20),
      }),
    );

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByText('68% · limite de 80% em cerca de 42 min')).toBeOnTheScreen();
    expect(screen.getByText('limite 80%')).toBeOnTheScreen();
    expect(screen.getByRole('progressbar', { name: '68% de carga, limite em 80%' })).toHaveAccessibilityValue({
      now: 68,
    });
  });

  it('explains the limit and lists the reminders of the session', async () => {
    api.getSession.mockResolvedValue(
      buildSession({
        projectedChargingEndsAt: secondsAhead(30 * 60),
        projectedGraceEndsAt: secondsAhead(40 * 60),
        projectedIdleStartsAt: secondsAhead(40 * 60),
      }),
    );

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Ajustar limite' }));
    expect(await screen.findByText('Limite da recarga')).toBeOnTheScreen();
    expect(screen.getByText('Até completar')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Entendi' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Lembrete' }));
    expect(await screen.findByText('Lembretes desta recarga')).toBeOnTheScreen();
    expect(screen.getByText('Recarga concluída')).toBeOnTheScreen();
    expect(screen.getByText('Tolerância acabando')).toBeOnTheScreen();
    expect(screen.getByText('Multa de ocupação')).toBeOnTheScreen();
  });

  it('plugs the connector when the charger starts', async () => {
    api.getSession.mockResolvedValue(buildSession({ status: 'PENDING', energyKwh: 0 }));

    await renderWithProviders(<SessionScreen sessionId="session-1" />);
    expect(await screen.findByText('Liberando o carregador')).toBeOnTheScreen();

    api.getSession.mockResolvedValue(buildSession());
    expect(await screen.findByTestId('plug-connector', {}, { timeout: 4000 })).toBeOnTheScreen();
    expect(screen.getByTestId('car-port')).toBeOnTheScreen();
  });

  it('walks through the release checklist while pending and can cancel', async () => {
    api.getSession.mockResolvedValue(buildSession({ status: 'PENDING', energyKwh: 0 }));
    api.stopSession.mockResolvedValue(buildClosedSession({ status: 'INTERRUPTED' }));

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByText('Liberando o carregador')).toBeOnTheScreen();
    expect(screen.getByText('Unidade validada')).toBeOnTheScreen();
    expect(screen.getByText('Carregador liberado')).toBeOnTheScreen();
    expect(screen.getByLabelText('Em andamento')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(api.stopSession).toHaveBeenCalledWith('session-1');
  });

  it('confirms before stopping and then shows the receipt', async () => {
    api.getSession.mockResolvedValue(buildSession({ startedAt: secondsAgo(17) }));
    api.stopSession.mockResolvedValue(buildClosedSession({ idleFeeCents: 0, idleMinutes: 0, totalCents: 178 }));

    await renderWithProviders(<SessionScreen sessionId="session-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Encerrar recarga' }));
    expect(screen.getByText('Encerrar a recarga agora?')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Encerrar agora' }));

    expect(api.stopSession).toHaveBeenCalledWith('session-1');
    expect(await screen.findByRole('header', { name: 'Recarga encerrada' })).toBeOnTheScreen();
    expect(screen.getByLabelText(`Total R$${NBSP}1,78`)).toBeOnTheScreen();
    expect(screen.getByText('Retirado dentro da tolerância')).toBeOnTheScreen();
    expect(screen.getByLabelText('Recarga encerrada com sucesso')).toBeOnTheScreen();
  });

  it('counts the grace period down after charging completes', async () => {
    api.getSession.mockResolvedValue(
      buildSession({
        status: 'GRACE',
        chargingEndedAt: secondsAgo(4),
        graceEndsAt: secondsAhead(6),
        energyKwh: 2,
        powerKw: 0,
        energyCostCents: 178,
      }),
    );

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByText('Recarga concluída')).toBeOnTheScreen();
    expect(screen.getByText('Tolerância')).toBeOnTheScreen();
    expect(screen.getByText('Sem multa por')).toBeOnTheScreen();
    expect(screen.getByText(/^0[56]:\d\d$/)).toBeOnTheScreen();
    expect(screen.getByText(/^Retire o veículo até \d\d:\d\d para liberar a vaga sem multa\.$/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Avisar quando faltar 2 min' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Retirei o veículo · encerrar' })).toBeOnTheScreen();
  });

  it('shows the idle fee accumulating after the grace period', async () => {
    api.getChargePoint.mockResolvedValue(buildChargePoint({ status: 'IDLE', queueLength: 2 }));
    api.getSession.mockResolvedValue(
      buildSession({
        status: 'IDLE',
        chargingEndedAt: secondsAgo(30),
        graceEndsAt: secondsAgo(19.5),
        energyKwh: 2,
        powerKw: 0,
        energyCostCents: 178,
        idleMinutes: 20,
        idleFeeCents: 500,
      }),
    );

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByRole('header', { name: 'Multa de ocupação em curso' })).toBeOnTheScreen();
    expect(screen.getByText('Tempo na vaga')).toBeOnTheScreen();
    expect(screen.getByText('5,00')).toBeOnTheScreen();
    expect(screen.getByText(`Faltam R$${NBSP}25,00 até o teto`)).toBeOnTheScreen();
    expect(screen.getByText(/O valor entra no rateio da unidade B · 42\./)).toBeOnTheScreen();
    expect(await screen.findByText('2 na fila para este ponto')).toBeOnTheScreen();
  });

  it('stops an idle session without asking again', async () => {
    api.getSession.mockResolvedValue(buildSession({ status: 'IDLE', graceEndsAt: secondsAgo(5), idleFeeCents: 125 }));
    api.stopSession.mockResolvedValue(buildClosedSession());

    await renderWithProviders(<SessionScreen sessionId="session-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Retirei o veículo · encerrar' }));

    expect(api.stopSession).toHaveBeenCalledWith('session-1');
    expect(await screen.findByText(`44 min × R$${NBSP}0,25`)).toBeOnTheScreen();
  });

  it.each(['GRACE', 'IDLE'] as const)('keeps the stop button tappable in the %s footer', async (status) => {
    api.getSession.mockResolvedValue(buildSession({ status, graceEndsAt: secondsAgo(5) }));

    await renderWithProviders(<SessionScreen sessionId="session-1" />);
    const button = await screen.findByRole('button', { name: 'Retirei o veículo · encerrar' });

    expect(button).not.toHaveStyle({ flex: 1 });
  });

  it('shows the receipt of a closed session and goes home', async () => {
    api.getSession.mockResolvedValue(buildClosedSession());

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByLabelText(`Total R$${NBSP}12,78`)).toBeOnTheScreen();
    expect(screen.getByText(`2,00 kWh × R$${NBSP}0,89/kWh`)).toBeOnTheScreen();
    expect(screen.getByText('Rateio mensal da unidade B · 42')).toBeOnTheScreen();
    expect(screen.getByText('×0,80')).toBeOnTheScreen();
    expect(screen.getByText(`R$${NBSP}11,00`)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar ao início' }));
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  it('shares a pt-BR summary of the receipt', async () => {
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
    api.getSession.mockResolvedValue(buildClosedSession());

    await renderWithProviders(<SessionScreen sessionId="session-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Compartilhar recibo' }));

    expect(share).toHaveBeenCalledWith({
      title: 'Recibo da recarga',
      message: expect.stringContaining(`Total: R$${NBSP}12,78`),
    });
  });

  it('does not offer sharing while the session is open', async () => {
    api.getSession.mockResolvedValue(buildSession({ startedAt: secondsAgo(17) }));

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByText('Carregando')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Compartilhar recibo' })).not.toBeOnTheScreen();
  });

  it('shows a not found message', async () => {
    api.getSession.mockRejectedValue(new chargingApi.ChargingApiError(404, 'SESSION_NOT_FOUND'));

    await renderWithProviders(<SessionScreen sessionId="missing" />);

    await waitFor(() => expect(screen.getByText('Esta recarga não foi encontrada.')).toBeOnTheScreen());
  });

  it('lets the driver cancel a session awaiting card payment', async () => {
    api.getSession.mockResolvedValue(
      buildSession({
        status: 'AWAITING_PAYMENT',
        regime: 'COMMERCIAL',
        energyKwh: 0,
        payment: paymentFixture,
      }),
    );
    api.stopSession.mockResolvedValue(buildClosedSession({ status: 'INTERRUPTED', regime: 'COMMERCIAL' }));

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByRole('header', { name: 'Pagamento no cartão' })).toBeOnTheScreen();
    expect(screen.getByLabelText(`Pré-autorização de R$${NBSP}200,40`)).toBeOnTheScreen();
    expect(screen.getByText('Tarifa desta sessão')).toBeOnTheScreen();
    expect(screen.getByText('IA')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar recarga' }));

    expect(api.stopSession).toHaveBeenCalledWith('session-1');
    expect(await screen.findByText('Recarga interrompida')).toBeOnTheScreen();
  });

  it('pays with a fresh payment sheet and starts charging', async () => {
    api.getSession.mockResolvedValue(
      buildSession({ status: 'AWAITING_PAYMENT', regime: 'COMMERCIAL', energyKwh: 0, payment: paymentFixture }),
    );
    api.createSessionPaymentSheet.mockResolvedValue(sheetFixture);
    cardPayment.presentCardPayment.mockResolvedValue('completed');
    api.confirmSessionPayment.mockResolvedValue(
      buildSession({ status: 'ACTIVE', regime: 'COMMERCIAL', payment: { ...paymentFixture, status: 'AUTHORIZED' } }),
    );

    await renderWithProviders(<SessionScreen sessionId="session-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: `Autorizar R$${NBSP}200,40 e iniciar` }));

    expect(await screen.findByText('Pagamento autorizado. Carregador liberado!')).toBeOnTheScreen();
    expect(api.createSessionPaymentSheet).toHaveBeenCalledWith('session-1');
    expect(cardPayment.presentCardPayment).toHaveBeenCalledWith(sheetFixture);
    expect(screen.getByText('Carregando')).toBeOnTheScreen();
    expect(screen.getByText(/com fator ×0,80$/)).toBeOnTheScreen();
  });

  it('shows the card error from the payment sheet', async () => {
    api.getSession.mockResolvedValue(
      buildSession({ status: 'AWAITING_PAYMENT', regime: 'COMMERCIAL', energyKwh: 0, payment: paymentFixture }),
    );
    api.createSessionPaymentSheet.mockResolvedValue(sheetFixture);
    cardPayment.presentCardPayment.mockRejectedValue(new cardPaymentModule.CardPaymentError('Cartão sem saldo'));

    await renderWithProviders(<SessionScreen sessionId="session-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: `Autorizar R$${NBSP}200,40 e iniciar` }));

    expect(await screen.findByText('Cartão sem saldo')).toBeOnTheScreen();
    expect(api.confirmSessionPayment).not.toHaveBeenCalled();
  });

  it('shows what was charged on the card in the receipt', async () => {
    api.getSession.mockResolvedValue(
      buildClosedSession({
        regime: 'COMMERCIAL',
        payment: { ...paymentFixture, status: 'CAPTURED', capturedCents: 1278 },
      }),
    );

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByText('Cobrado no cartão')).toBeOnTheScreen();
    expect(screen.getByText(`R$${NBSP}12,78`)).toBeOnTheScreen();
    expect(
      screen.getByText(`Pré-autorização de R$${NBSP}200,40 · o restante volta ao limite do cartão`),
    ).toBeOnTheScreen();
  });
});
