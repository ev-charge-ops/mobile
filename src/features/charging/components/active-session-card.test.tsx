import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import * as chargingApi from '@/features/charging/api/charging-api';
import { ActiveSessionCard } from '@/features/charging/components/active-session-card';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';
import { buildSession } from '@/features/charging/testing/session-fixtures';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

jest.mock('@/features/charging/api/charging-api', () => {
  const actual = jest.requireActual('@/features/charging/api/charging-api');
  return { ...actual, getActiveSession: jest.fn() };
});

const api = jest.mocked(chargingApi);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<ActiveSessionCard />', () => {
  it('shows the open session and opens it', async () => {
    api.getActiveSession.mockResolvedValue(buildSession({ id: 'session-7' }));

    await renderWithProviders(<ActiveSessionCard />);

    expect(await screen.findByText('Carregando')).toBeOnTheScreen();
    expect(screen.getByText('Garagem L1 · Vaga 12')).toBeOnTheScreen();
    expect(screen.getByText('1,48')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: /Acompanhar recarga/ }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/sessions/[sessionId]', params: { sessionId: 'session-7' } });
  });

  it('highlights the idle fee', async () => {
    api.getActiveSession.mockResolvedValue(buildSession({ status: 'IDLE', idleFeeCents: 250, totalCents: 428 }));

    await renderWithProviders(<ActiveSessionCard />);

    expect(await screen.findByText('Taxa de ocupação em curso')).toBeOnTheScreen();
    expect(screen.getByText('4,28')).toBeOnTheScreen();
  });

  it('renders nothing without an open session', async () => {
    api.getActiveSession.mockResolvedValue(null);

    await renderWithProviders(<ActiveSessionCard />);

    await waitFor(() => expect(api.getActiveSession).toHaveBeenCalled());
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});
