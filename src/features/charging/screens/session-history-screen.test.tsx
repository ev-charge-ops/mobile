import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as chargingApi from '@/features/charging/api/charging-api';
import * as statementApi from '@/features/charging/api/statement-api';
import type { MyMonthlyStatement } from '@/features/charging/api/statement-api';
import { SessionHistoryScreen } from '@/features/charging/screens/session-history-screen';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';
import { buildClosedSession, buildSession } from '@/features/charging/testing/session-fixtures';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), navigate: jest.fn() } }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, listMySessions: jest.fn() };
});

jest.mock('@/features/charging/api/statement-api', () => ({ getMyMonthlyStatement: jest.fn() }));

const api = jest.mocked(chargingApi);
const statements = jest.mocked(statementApi);

const NBSP = ' ';
const NOW = Date.parse('2026-10-07T15:00:00.000Z');

function page(items: chargingApi.ChargingSession[], total = items.length) {
  return { items, total, page: 1, pageSize: 100 };
}

function buildStatement(overrides: Partial<MyMonthlyStatement> = {}): MyMonthlyStatement {
  return {
    organization: { id: 'org-1', name: 'Residencial Aclimação' },
    unitLabel: 'B · 42',
    month: '2026-10',
    status: 'OPEN',
    closesAt: '2026-11-01T02:59:59.999Z',
    energyKwh: 54.3,
    energyCents: 4833,
    utilityRateCents: 89,
    accessFeeCents: 3500,
    idleFeeCents: 0,
    totalCents: 8333,
    sessionsCount: 4,
    dailyEnergy: [
      { date: '2026-10-02', energyKwh: 18.42 },
      { date: '2026-10-06', energyKwh: 14.1 },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
  statements.getMyMonthlyStatement.mockResolvedValue(buildStatement());
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('<SessionHistoryScreen />', () => {
  it('shows the unit statement and the sessions of the current month', async () => {
    api.listMySessions.mockResolvedValue(
      page([
        buildClosedSession({ id: 's1' }),
        buildSession({
          id: 's3',
          status: 'INTERRUPTED',
          startedAt: '2026-10-07T12:00:00.000Z',
          chargePoint: { id: 'cp-2', code: 'L1-02', name: 'Garagem L1 · Vaga 13' },
          energyKwh: 0.5,
          totalCents: 50,
        }),
      ]),
    );

    await renderWithProviders(<SessionHistoryScreen />);

    expect(await screen.findByText('2 sessões')).toBeOnTheScreen();
    expect(api.listMySessions).toHaveBeenCalledWith(1, 100, '2026-10');
    expect(statements.getMyMonthlyStatement).toHaveBeenCalledWith('2026-10');
    expect(screen.getByText('Out 2026')).toBeOnTheScreen();
    expect(await screen.findByText('Seu rateio · unidade B · 42')).toBeOnTheScreen();
    expect(screen.getByText('83,33')).toBeOnTheScreen();
    expect(screen.getByText('Fecha 31/10')).toBeOnTheScreen();
    expect(screen.getByText(`Energia · 54,30 kWh × R$${NBSP}0,89`)).toBeOnTheScreen();
    expect(screen.getByText(`R$${NBSP}35,00`)).toBeOnTheScreen();
    expect(screen.getByText('Ocupação após tolerância')).toBeOnTheScreen();
    expect(screen.getAllByTestId('statement-bar-active')).toHaveLength(2);
    expect(screen.getAllByTestId('statement-bar')).toHaveLength(29);
    expect(screen.getByText('2,00 kWh')).toBeOnTheScreen();
    expect(screen.getByText('L1-01 · 19min')).toBeOnTheScreen();
    expect(screen.getByText(`R$${NBSP}12,78`)).toBeOnTheScreen();
    expect(screen.getByText(/^L1-02 · .* · Interrompida$/)).toBeOnTheScreen();
    expect(screen.getAllByText('OUT')).toHaveLength(2);
  });

  it('marks a closed statement and hides it without a condo unit', async () => {
    statements.getMyMonthlyStatement.mockImplementation(async (month) =>
      month === '2026-09' ? buildStatement({ month, status: 'CLOSED' }) : null,
    );
    api.listMySessions.mockResolvedValue(page([buildClosedSession({ startedAt: '2026-10-02T12:00:00.000Z' })]));

    await renderWithProviders(<SessionHistoryScreen />);

    expect(await screen.findByText('1 sessão')).toBeOnTheScreen();
    expect(screen.queryByTestId('monthly-statement-card')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(await screen.findByText('Fechado')).toBeOnTheScreen();
    expect(screen.getByText('Set 2026')).toBeOnTheScreen();
    expect(api.listMySessions).toHaveBeenCalledWith(1, 100, '2026-09');
  });

  it('does not go past the current month', async () => {
    api.listMySessions.mockResolvedValue(page([]));

    await renderWithProviders(<SessionHistoryScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(await screen.findByText('Nenhuma recarga em outubro')).toBeOnTheScreen();
    expect(api.listMySessions).not.toHaveBeenCalledWith(1, 100, '2026-11');
  });

  it('opens the session receipt', async () => {
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

    expect(await screen.findByText('1 sessão')).toBeOnTheScreen();
  });
});
