import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as chargingApi from '@/features/charging/api/charging-api';
import { CurrentChargeScreen } from '@/features/charging/screens/current-charge-screen';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';
import { buildSession } from '@/features/charging/testing/session-fixtures';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), navigate: jest.fn() } }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, getActiveSession: jest.fn() };
});

const api = jest.mocked(chargingApi);

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
    expect(router.navigate).toHaveBeenCalledWith('/');
  });
});
