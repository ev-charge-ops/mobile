import * as authApi from '@/features/auth/api/auth-api';
import { createSessionStore, discardStoredSession, REFRESH_TOKEN_KEY } from '@/features/auth/session/session-store';
import * as secureStorage from '@/lib/secure-storage';

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

const user: authApi.AuthUser = { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'DRIVER', emailVerified: true };

function session(suffix: string): authApi.AuthSession {
  return { user, accessToken: `access-${suffix}`, refreshToken: `refresh-${suffix}` };
}

beforeEach(() => {
  storage.clear();
  jest.clearAllMocks();
});

describe('createSessionStore', () => {
  it('starts loading and becomes anonymous without a stored refresh token', async () => {
    const store = createSessionStore();
    expect(store.getSnapshot().status).toBe('loading');

    await store.restoreSession();

    expect(store.getSnapshot()).toEqual({ status: 'anonymous', user: null });
    expect(api.refresh).not.toHaveBeenCalled();
  });

  it('restores the session with the stored refresh token and stores the rotated one', async () => {
    storage.set(REFRESH_TOKEN_KEY, 'refresh-old');
    api.refresh.mockResolvedValue(session('new'));
    const store = createSessionStore();

    await store.restoreSession();

    expect(api.refresh).toHaveBeenCalledWith('refresh-old');
    expect(store.getSnapshot()).toEqual({ status: 'authenticated', user });
    expect(storage.get(REFRESH_TOKEN_KEY)).toBe('refresh-new');
    expect(await store.tokenHandlers.getAccessToken()).toBe('access-new');
  });

  it('restores only once when called repeatedly', async () => {
    storage.set(REFRESH_TOKEN_KEY, 'refresh-old');
    api.refresh.mockResolvedValue(session('new'));
    const store = createSessionStore();

    await Promise.all([store.restoreSession(), store.restoreSession()]);

    expect(api.refresh).toHaveBeenCalledTimes(1);
  });

  it('drops a rejected refresh token', async () => {
    storage.set(REFRESH_TOKEN_KEY, 'refresh-revoked');
    api.refresh.mockRejectedValue(new authApi.AuthApiError(401));
    const store = createSessionStore();

    await store.restoreSession();

    expect(store.getSnapshot().status).toBe('anonymous');
    expect(storage.has(REFRESH_TOKEN_KEY)).toBe(false);
  });

  it('keeps the refresh token when the network is unavailable', async () => {
    storage.set(REFRESH_TOKEN_KEY, 'refresh-old');
    api.refresh.mockRejectedValue(new authApi.AuthApiError(null));
    const store = createSessionStore();

    await store.restoreSession();

    expect(store.getSnapshot().status).toBe('anonymous');
    expect(storage.get(REFRESH_TOKEN_KEY)).toBe('refresh-old');
  });

  it('refreshes the access token through the api client handlers', async () => {
    const store = createSessionStore();
    await store.startSession(session('1'));
    api.refresh.mockResolvedValue(session('2'));

    const token = await store.tokenHandlers.refreshAccessToken();

    expect(api.refresh).toHaveBeenCalledWith('refresh-1');
    expect(token).toBe('access-2');
    expect(storage.get(REFRESH_TOKEN_KEY)).toBe('refresh-2');
  });

  it('returns null when the token refresh fails and clears the session when unauthorized', async () => {
    const store = createSessionStore();
    await store.startSession(session('1'));
    api.refresh.mockRejectedValue(new authApi.AuthApiError(401));

    expect(await store.tokenHandlers.refreshAccessToken()).toBeNull();

    store.tokenHandlers.onUnauthorized?.();

    expect(store.getSnapshot().status).toBe('anonymous');
    expect(await store.tokenHandlers.getAccessToken()).toBeNull();
  });

  it('logs out on the server and clears the local session', async () => {
    const store = createSessionStore();
    await store.startSession(session('1'));
    api.logout.mockResolvedValue();

    await store.endSession();

    expect(api.logout).toHaveBeenCalledWith('refresh-1');
    expect(store.getSnapshot()).toEqual({ status: 'anonymous', user: null });
    expect(storage.has(REFRESH_TOKEN_KEY)).toBe(false);
    expect(await store.tokenHandlers.getAccessToken()).toBeNull();
  });

  it('clears the local session even when the logout request fails', async () => {
    const store = createSessionStore();
    await store.startSession(session('1'));
    api.logout.mockRejectedValue(new authApi.AuthApiError(null));

    await store.endSession();

    expect(store.getSnapshot().status).toBe('anonymous');
    expect(storage.has(REFRESH_TOKEN_KEY)).toBe(false);
  });

  it('notifies subscribers until they unsubscribe', async () => {
    const store = createSessionStore();
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    await store.startSession(session('1'));
    unsubscribe();
    await store.endSession();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('discardStoredSession', () => {
  it('logs out the stored refresh token and removes it', async () => {
    storage.set(REFRESH_TOKEN_KEY, 'refresh-1');
    api.logout.mockResolvedValue();

    await discardStoredSession();

    expect(api.logout).toHaveBeenCalledWith('refresh-1');
    expect(storage.has(REFRESH_TOKEN_KEY)).toBe(false);
  });

  it('removes the stored refresh token even when the logout request fails', async () => {
    storage.set(REFRESH_TOKEN_KEY, 'refresh-1');
    api.logout.mockRejectedValue(new authApi.AuthApiError(null));

    await discardStoredSession();

    expect(storage.has(REFRESH_TOKEN_KEY)).toBe(false);
  });
});
