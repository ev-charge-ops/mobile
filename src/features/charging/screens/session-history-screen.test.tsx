import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as chargingApi from '@/features/charging/api/charging-api';
import { SessionHistoryScreen } from '@/features/charging/screens/session-history-screen';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';
import { buildClosedSession, buildSession } from '@/features/charging/testing/session-fixtures';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, listMySessions: jest.fn() };
});

const api = jest.mocked(chargingApi);

const NBSP = ' ';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<SessionHistoryScreen />', () => {
  it('lists the sessions with totals, idle fees and status', async () => {
    api.listMySessions.mockResolvedValue({
      items: [
        buildClosedSession({ id: 's1' }),
        buildClosedSession({
          id: 's2',
          chargePoint: { id: 'cp-2', code: 'L1-02', name: 'Garagem L1 · Vaga 13' },
          energyKwh: 16.405,
          energyCostCents: 1460,
          idleFeeCents: 0,
          totalCents: 1460,
        }),
        buildSession({ id: 's3', status: 'INTERRUPTED', energyCostCents: 50, idleFeeCents: 0, totalCents: 50 }),
      ],
      total: 3,
      page: 1,
      pageSize: 20,
    });

    await renderWithProviders(<SessionHistoryScreen />);

    expect(await screen.findByText('3 recargas')).toBeOnTheScreen();
    expect(api.listMySessions).toHaveBeenCalledWith(1, 20);
    expect(screen.getByText(`R$${NBSP}12,78`)).toBeOnTheScreen();
    expect(screen.getByText(`+ R$${NBSP}11,00 ocupação`)).toBeOnTheScreen();
    expect(screen.getByText(`R$${NBSP}14,60`)).toBeOnTheScreen();
    expect(screen.getAllByText('Concluída')).toHaveLength(2);
    expect(screen.getByText('Interrompida')).toBeOnTheScreen();
    expect(screen.getByText('19,9')).toBeOnTheScreen();
  });

  it('opens the session detail', async () => {
    api.listMySessions.mockResolvedValue({
      items: [buildClosedSession({ id: 's1' })],
      total: 1,
      page: 1,
      pageSize: 20,
    });

    await renderWithProviders(<SessionHistoryScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: /Garagem L1 · Vaga 12/ }));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/sessions/[sessionId]', params: { sessionId: 's1' } });
  });

  it('shows the empty state with a shortcut to the charge points', async () => {
    api.listMySessions.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });

    await renderWithProviders(<SessionHistoryScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Encontrar pontos de recarga' }));

    expect(screen.getByText('Nenhuma recarga ainda')).toBeOnTheScreen();
    expect(router.push).toHaveBeenCalledWith('/charge-points');
  });

  it('retries after a failure', async () => {
    api.listMySessions
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ items: [buildClosedSession()], total: 1, page: 1, pageSize: 20 });

    await renderWithProviders(<SessionHistoryScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('1 recarga')).toBeOnTheScreen();
  });
});
