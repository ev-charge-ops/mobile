import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { ActiveSessionCard } from '@/features/charging/components/active-session-card';
import { renderWithProviders } from '@/features/charging/testing/render-with-providers';
import { buildClosedSession, buildSession } from '@/features/charging/testing/session-fixtures';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<ActiveSessionCard />', () => {
  it('shows the open session with the battery level and opens it', async () => {
    await renderWithProviders(<ActiveSessionCard session={buildSession({ id: 'session-7', socPercent: 66.4 })} />);

    expect(screen.getByText('Carregando')).toBeOnTheScreen();
    expect(screen.getByText('Garagem L1 · Vaga 12')).toBeOnTheScreen();
    expect(screen.getByText('1,48')).toBeOnTheScreen();
    expect(screen.getByText('66')).toBeOnTheScreen();
    expect(screen.getByText('66%')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Acompanhar sessão' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/sessions/[sessionId]', params: { sessionId: 'session-7' } });
  });

  it('highlights the idle fee', async () => {
    await renderWithProviders(
      <ActiveSessionCard session={buildSession({ status: 'IDLE', idleFeeCents: 250, totalCents: 428 })} />,
    );

    expect(screen.getByText('Taxa de ocupação em curso')).toBeOnTheScreen();
    expect(screen.getByText('4,28')).toBeOnTheScreen();
  });

  it('shows a dash when the battery level is unknown', async () => {
    await renderWithProviders(<ActiveSessionCard session={buildSession({ socPercent: null })} />);

    expect(screen.getByText('—')).toBeOnTheScreen();
    expect(screen.queryByText('Estado de carga')).not.toBeOnTheScreen();
  });

  it('renders nothing for a closed session', async () => {
    await renderWithProviders(<ActiveSessionCard session={buildClosedSession()} />);

    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});
