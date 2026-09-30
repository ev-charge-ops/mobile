import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as chargingApi from '@/features/charging/api/charging-api';
import { SessionHistoryScreen } from '@/features/charging/screens/session-history-screen';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';
import { buildClosedSession, buildSession } from '@/features/charging/testing/session-fixtures';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), navigate: jest.fn() } }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, listMySessions: jest.fn() };
});

const api = jest.mocked(chargingApi);

const NBSP = ' ';
const NOW = Date.parse('2026-10-07T15:00:00.000Z');

function page(items: chargingApi.ChargingSession[], total = items.length) {
  return { items, total, page: 1, pageSize: 100 };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('<SessionHistoryScreen />', () => {
  it('summarizes the current month with totals, weekly bars and the regime banner', async () => {
    api.listMySessions.mockResolvedValue(
      page([
        buildClosedSession({ id: 's1', startedAt: '2026-10-02T12:00:00.000Z' }),
        buildClosedSession({
          id: 's2',
          startedAt: '2026-10-06T12:00:00.000Z',
          chargePoint: { id: 'cp-2', code: 'L1-02', name: 'Garagem L1 · Vaga 13' },
          energyKwh: 16.405,
          energyCostCents: 1460,
          idleFeeCents: 0,
          totalCents: 1460,
        }),
        buildSession({
          id: 's3',
          status: 'INTERRUPTED',
          startedAt: '2026-10-07T12:00:00.000Z',
          energyCostCents: 50,
          idleFeeCents: 0,
          totalCents: 50,
        }),
      ]),
    );

    await renderWithProviders(<SessionHistoryScreen />);

    expect(await screen.findAllByText('3 recargas')).toHaveLength(2);
    expect(api.listMySessions).toHaveBeenCalledWith(1, 100, '2026-10');
    expect(screen.getByRole('tab', { name: 'Outubro' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Setembro' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Agosto' })).toBeOnTheScreen();
    expect(screen.getAllByText('19,9')).toHaveLength(2);
    expect(screen.getByText('Total no mês')).toBeOnTheScreen();
    expect(screen.getByText('27,88')).toBeOnTheScreen();
    expect(screen.getByLabelText('Semana 1: 19,9 kWh')).toBeOnTheScreen();
    expect(screen.getByLabelText('Semana 2: sem recargas')).toBeOnTheScreen();
    expect(screen.getByText('Condomínio · energia a custo')).toBeOnTheScreen();
    expect(screen.queryByText('Comercial · preço dinâmico')).toBeNull();
    expect(screen.getByText(`+ R$${NBSP}11,00 ocupação`)).toBeOnTheScreen();
    expect(screen.getByText('Interrompida')).toBeOnTheScreen();
  });

  it('loads another month from the segmented control', async () => {
    api.listMySessions.mockImplementation(async (_page, _size, month) =>
      month === '2026-09'
        ? page([buildClosedSession({ id: 's9', regime: 'COMMERCIAL', startedAt: '2026-09-20T12:00:00.000Z' })])
        : page([]),
    );

    await renderWithProviders(<SessionHistoryScreen />);
    expect(await screen.findByText('Nenhuma recarga em outubro')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'Setembro' }));

    expect(await screen.findByText('Comercial · preço dinâmico')).toBeOnTheScreen();
    expect(api.listMySessions).toHaveBeenCalledWith(1, 100, '2026-09');
    expect(screen.getByLabelText(/^Semana 3: 2(,0)? kWh$/)).toBeOnTheScreen();
  });

  it('labels the total as partial while more pages remain', async () => {
    api.listMySessions.mockResolvedValue(page([buildClosedSession({ startedAt: '2026-10-02T12:00:00.000Z' })], 150));

    await renderWithProviders(<SessionHistoryScreen />);

    expect(await screen.findByText('Total das recargas carregadas')).toBeOnTheScreen();
  });

  it('opens the session detail', async () => {
    api.listMySessions.mockResolvedValue(page([buildClosedSession({ id: 's1' })]));

    await renderWithProviders(<SessionHistoryScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: /Garagem L1 · Vaga 12/ }));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/sessions/[sessionId]', params: { sessionId: 's1' } });
  });

  it('shows the empty state with a shortcut to the charge points', async () => {
    api.listMySessions.mockResolvedValue(page([]));

    await renderWithProviders(<SessionHistoryScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Encontrar pontos de recarga' }));

    expect(screen.getByText('Nenhuma recarga em outubro')).toBeOnTheScreen();
    expect(router.navigate).toHaveBeenCalledWith('/points');
  });

  it('retries after a failure', async () => {
    api.listMySessions
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page([buildClosedSession()]));

    await renderWithProviders(<SessionHistoryScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findAllByText('1 recarga')).toHaveLength(2);
  });
});
