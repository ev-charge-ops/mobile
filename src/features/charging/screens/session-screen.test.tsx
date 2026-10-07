import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as chargingApi from '@/features/charging/api/charging-api';
import { SessionScreen } from '@/features/charging/screens/session-screen';
import { buildClosedSession, buildSession } from '@/features/charging/testing/session-fixtures';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn(), dismissTo: jest.fn(), canGoBack: jest.fn(() => true) },
}));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, getSession: jest.fn(), stopSession: jest.fn() };
});

const api = jest.mocked(chargingApi);

const NBSP = ' ';

const secondsAgo = (seconds: number) => new Date(Date.now() - seconds * 1000).toISOString();
const secondsAhead = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<SessionScreen />', () => {
  it('shows the live energy, power and running cost', async () => {
    api.getSession.mockResolvedValue(buildSession({ startedAt: secondsAgo(17) }));

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByText('Recarga em andamento')).toBeOnTheScreen();
    expect(screen.getByText('1,48')).toBeOnTheScreen();
    expect(screen.getByText('Carregando · 17 min')).toBeOnTheScreen();
    expect(screen.getByText('Custo até agora')).toBeOnTheScreen();
    expect(screen.getByText('1,32')).toBeOnTheScreen();
    expect(screen.getByText('60×')).toBeOnTheScreen();
    expect(api.getSession).toHaveBeenCalledWith('session-1');
  });

  it('confirms before stopping and then shows the receipt', async () => {
    api.getSession.mockResolvedValue(buildSession({ startedAt: secondsAgo(17) }));
    api.stopSession.mockResolvedValue(buildClosedSession({ idleFeeCents: 0, idleMinutes: 0, totalCents: 178 }));

    await renderWithProviders(<SessionScreen sessionId="session-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Encerrar recarga' }));
    expect(screen.getByText('Encerrar a recarga agora?')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Encerrar agora' }));

    expect(api.stopSession).toHaveBeenCalledWith('session-1');
    expect(await screen.findByText('Recibo')).toBeOnTheScreen();
    expect(screen.getByLabelText(`Total R$${NBSP}1,78`)).toBeOnTheScreen();
    expect(screen.getByText('Veículo retirado dentro da tolerância')).toBeOnTheScreen();
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

    expect(await screen.findByRole('header', { name: 'Carga concluída' })).toBeOnTheScreen();
    expect(screen.getByText('Tolerância gratuita')).toBeOnTheScreen();
    expect(screen.getByText(/^0[56]:\d\d$/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Retirei o veículo · encerrar' })).toBeOnTheScreen();
  });

  it('shows the idle fee accumulating after the grace period', async () => {
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

    expect(await screen.findByRole('header', { name: 'Taxa de ocupação' })).toBeOnTheScreen();
    expect(screen.getByText('Tempo excedente na vaga')).toBeOnTheScreen();
    expect(screen.getByText(`R$${NBSP}5,00 / R$${NBSP}30,00`)).toBeOnTheScreen();
  });

  it('stops an idle session without asking again', async () => {
    api.getSession.mockResolvedValue(buildSession({ status: 'IDLE', graceEndsAt: secondsAgo(5), idleFeeCents: 125 }));
    api.stopSession.mockResolvedValue(buildClosedSession());

    await renderWithProviders(<SessionScreen sessionId="session-1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Retirei o veículo · encerrar' }));

    expect(api.stopSession).toHaveBeenCalledWith('session-1');
    expect(await screen.findByText(`44 min × R$${NBSP}0,25`)).toBeOnTheScreen();
  });

  it('shows the receipt of a closed session and goes home', async () => {
    api.getSession.mockResolvedValue(buildClosedSession());

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByLabelText(`Total R$${NBSP}12,78`)).toBeOnTheScreen();
    expect(screen.getByText(`2,00 kWh · R$${NBSP}1,78`)).toBeOnTheScreen();
    expect(screen.getByText('×0,80')).toBeOnTheScreen();
    expect(screen.getByText(`R$${NBSP}11,00`)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar ao início' }));
    expect(router.dismissTo).toHaveBeenCalledWith('/');
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
        payment: {
          paymentIntentId: 'pi_1',
          status: 'PENDING_AUTHORIZATION',
          currency: 'BRL',
          authorizedCents: 20040,
          capturedCents: null,
          failureCode: null,
          authorizedAt: null,
          capturedAt: null,
          canceledAt: null,
        },
      }),
    );
    api.stopSession.mockResolvedValue(buildClosedSession({ status: 'INTERRUPTED', regime: 'COMMERCIAL' }));

    await renderWithProviders(<SessionScreen sessionId="session-1" />);

    expect(await screen.findByRole('header', { name: 'Pagamento pendente' })).toBeOnTheScreen();
    expect(screen.getByText(`R$${NBSP}200,40`)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar recarga' }));

    expect(api.stopSession).toHaveBeenCalledWith('session-1');
    expect(await screen.findByText('Recarga interrompida')).toBeOnTheScreen();
  });
});
