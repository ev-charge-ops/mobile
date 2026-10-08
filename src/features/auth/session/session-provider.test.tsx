import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import * as authApi from '@/features/auth/api/auth-api';
import { useSession } from '@/features/auth/session/session-context';
import { SessionProvider } from '@/features/auth/session/session-provider';
import { REFRESH_TOKEN_KEY } from '@/features/auth/session/session-store';
import { setAuthTokenHandlers } from '@/lib/api-client';
import * as secureStorage from '@/lib/secure-storage';

jest.mock('@/lib/api-client', () => ({ setAuthTokenHandlers: jest.fn() }));

jest.mock('@/features/auth/api/auth-api', () => {
  const actual = jest.requireActual('@/features/auth/api/auth-api');
  return { ...actual, refresh: jest.fn(), logout: jest.fn() };
});

jest.mock('@/lib/secure-storage', () => {
  const store = new Map<string, string>();
  return {
    store,
    getSecureItem: jest.fn(async (key: string) => store.get(key) ?? null),
    setSecureItem: jest.fn(async (key: string, value: string) => void store.set(key, value)),
    deleteSecureItem: jest.fn(async (key: string) => void store.delete(key)),
  };
});

const storage = (secureStorage as unknown as { store: Map<string, string> }).store;
const api = jest.mocked(authApi);

const storedSession: authApi.AuthSession = {
  user: { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'MANAGER', emailVerified: true, hasPassword: true, paymentMode: 'TEST', locationMode: 'DEMO', autoRefund: false },
  accessToken: 'access-new',
  refreshToken: 'refresh-new',
};

function SessionProbe() {
  const { status, user, endSession } = useSession();
  return (
    <>
      <Text>{status}</Text>
      {user && <Text>{user.name}</Text>}
      <Pressable accessibilityRole="button" accessibilityLabel="logout" onPress={() => endSession()} />
    </>
  );
}

function renderProvider() {
  return render(
    <SessionProvider>
      <SessionProbe />
    </SessionProvider>,
  );
}

beforeEach(() => {
  storage.clear();
  jest.clearAllMocks();
});

describe('<SessionProvider />', () => {
  it('restores a stored session and registers the token handlers', async () => {
    storage.set(REFRESH_TOKEN_KEY, 'refresh-old');
    api.refresh.mockResolvedValue(storedSession);

    await renderProvider();

    expect(await screen.findByText('authenticated')).toBeOnTheScreen();
    expect(screen.getByText('Ana')).toBeOnTheScreen();
    expect(api.refresh).toHaveBeenCalledWith('refresh-old', expect.anything());
    expect(setAuthTokenHandlers).toHaveBeenCalledWith(
      expect.objectContaining({ getAccessToken: expect.any(Function), refreshAccessToken: expect.any(Function) }),
    );
  });

  it('becomes anonymous after logout', async () => {
    storage.set(REFRESH_TOKEN_KEY, 'refresh-old');
    api.refresh.mockResolvedValue(storedSession);
    api.logout.mockResolvedValue();

    await renderProvider();
    await screen.findByText('authenticated');
    await fireEvent.press(screen.getByRole('button', { name: 'logout' }));

    expect(await screen.findByText('anonymous')).toBeOnTheScreen();
    expect(api.logout).toHaveBeenCalledWith('refresh-new');
    expect(storage.has(REFRESH_TOKEN_KEY)).toBe(false);
  });

  it('is anonymous without a stored refresh token', async () => {
    await renderProvider();

    expect(await screen.findByText('anonymous')).toBeOnTheScreen();
    expect(api.refresh).not.toHaveBeenCalled();
  });
});
