import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Text } from 'react-native';

import * as chargingApi from '@/features/charging/api/charging-api';
import type { ChargingSession } from '@/features/charging/api/charging-api';
import { activeSessionQueryKey } from '@/features/charging/api/use-charging-sessions';
import { CurrentChargeScreen } from '@/features/charging/screens/current-charge-screen';
import { createTestQueryClient, renderWithProviders } from '@/features/charging/testing/render-with-providers';
import { buildSession } from '@/features/charging/testing/session-fixtures';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), navigate: jest.fn() } }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, getActiveSession: jest.fn() };
});

const api = jest.mocked(chargingApi);

function getRefreshControl() {
  return screen.getByTestId('current-charge-scroll').props.refreshControl.props as {
    refreshing: boolean;
    onRefresh: () => Promise<void>;
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<CurrentChargeScreen />', () => {
  it('shows the active session', async () => {
    api.getActiveSession.mockResolvedValue(buildSession());

    await renderWithProviders(<CurrentChargeScreen />);

    expect(await screen.findByText('Sessão em andamento')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Acompanhar sessão' })).toBeOnTheScreen();
  });

  it('shows the empty state with a shortcut to the search tab', async () => {
    api.getActiveSession.mockResolvedValue(null);

    await renderWithProviders(<CurrentChargeScreen />);

    expect(await screen.findByText('Nenhuma recarga ativa')).toBeOnTheScreen();
    expect(screen.getByText('Nenhuma sessão ativa')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Buscar pontos' }));
    expect(router.navigate).toHaveBeenCalledWith('/points');
  });

  it('renders a custom title, subtitle and actions', async () => {
    api.getActiveSession.mockResolvedValue(null);

    await renderWithProviders(
      <CurrentChargeScreen title="Olá, Ana" subtitle="Residencial Aclimação" actions={<Text>Ação</Text>} />,
    );

    expect(await screen.findByText('Nenhuma recarga ativa')).toBeOnTheScreen();
    expect(screen.getByText('Olá, Ana')).toBeOnTheScreen();
    expect(screen.getByText('Residencial Aclimação')).toBeOnTheScreen();
    expect(screen.getByText('Ação')).toBeOnTheScreen();
    expect(screen.queryByText('Nenhuma sessão ativa')).toBeNull();
  });

  it('keeps the content and the pull spinner idle during a background refetch', async () => {
    const queryClient = createTestQueryClient();
    api.getActiveSession.mockResolvedValue(buildSession());

    await renderWithProviders(<CurrentChargeScreen />, queryClient);
    expect(await screen.findByRole('button', { name: 'Acompanhar sessão' })).toBeOnTheScreen();

    let finishRefetch: () => void = () => {};
    api.getActiveSession.mockReturnValue(
      new Promise((resolve) => {
        finishRefetch = () => resolve(buildSession());
      }),
    );
    let refetch: Promise<void> = Promise.resolve();
    await act(async () => {
      refetch = queryClient.refetchQueries({ queryKey: activeSessionQueryKey });
    });

    expect(queryClient.isFetching({ queryKey: activeSessionQueryKey })).toBe(1);
    expect(getRefreshControl().refreshing).toBe(false);
    expect(screen.queryByLabelText('Carregando recarga')).toBeNull();
    expect(screen.getByRole('button', { name: 'Acompanhar sessão' })).toBeOnTheScreen();

    await act(async () => {
      finishRefetch();
      await refetch;
    });
    expect(getRefreshControl().refreshing).toBe(false);
  });

  it('shows the pull spinner only while a pull to refresh is running', async () => {
    let finishRefresh: (session: ChargingSession) => void = () => {};
    api.getActiveSession.mockResolvedValue(buildSession());

    await renderWithProviders(<CurrentChargeScreen />);
    expect(await screen.findByRole('button', { name: 'Acompanhar sessão' })).toBeOnTheScreen();
    expect(getRefreshControl().refreshing).toBe(false);

    api.getActiveSession.mockReturnValue(
      new Promise((resolve) => {
        finishRefresh = resolve;
      }),
    );
    let pull: Promise<void> = Promise.resolve();
    await act(async () => {
      pull = getRefreshControl().onRefresh();
    });

    expect(api.getActiveSession).toHaveBeenCalledTimes(2);
    expect(getRefreshControl().refreshing).toBe(true);

    await act(async () => {
      finishRefresh(buildSession());
      await pull;
    });

    expect(getRefreshControl().refreshing).toBe(false);
  });
});
