import createClient from 'openapi-fetch';

import * as authApi from '@/features/auth/api/auth-api';
import {
  createSessionStore,
  discardStoredSession,
  REFRESH_TOKEN_KEY,
  RESTORE_ATTEMPTS,
} from '@/features/auth/session/session-store';
import { createAuthMiddleware } from '@/lib/api-client';
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

const user: authApi.AuthUser = { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'DRIVER', emailVerified: true, hasPassword: true };

function session(suffix: string): authApi.AuthSession {
  return { user, accessToken: `access-${suffix}`, refreshToken: `refresh-${suffix}` };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

type TestPaths = {
  '/me': {
    get: {
      parameters: { query?: never; header?: never; path?: never; cookie?: never };
      requestBody?: never;
      responses: { 200: { headers: Record<string, unknown>; content: { 'application/json': { id: string } } } };
    };
  };
};

function createTestClient(store: ReturnType<typeof createSessionStore>, statuses: number[]) {
  const fetchMock = jest.fn(async (request: Request) => {
    const status = statuses.shift() ?? 200;
    const body = JSON.stringify({ id: '1', auth: request.headers.get('Authorization') });
    return new Response(body, { status, headers: { 'Content-Type': 'application/json' } });
  });
  const client = createClient<TestPaths>({ baseUrl: 'https://api.test', fetch: fetchMock });
  client.use(createAuthMiddleware(() => store.tokenHandlers));
  return { client, fetchMock };
}

async function restoreWithRetries(store: ReturnType<typeof createSessionStore>) {
  const restoring = store.restoreSession();
  await jest.runAllTimersAsync();
  await restoring;
}

beforeEach(() => {
  storage.clear();
  jest.clearAllMocks();
  jest.useRealTimers();
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

    expect(api.refresh).toHaveBeenCalledWith('refresh-old', expect.anything());
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

  it('retries a transient failure at startup before restoring the session', async () => {
    jest.useFakeTimers();
    storage.set(REFRESH_TOKEN_KEY, 'refresh-old');
    api.refresh.mockRejectedValueOnce(new authApi.AuthApiError(503)).mockResolvedValueOnce(session('new'));
    const store = createSessionStore();

    await restoreWithRetries(store);

    expect(api.refresh).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot()).toEqual({ status: 'authenticated', user });
    expect(storage.get(REFRESH_TOKEN_KEY)).toBe('refresh-new');
  });

  it('goes offline instead of anonymous when the network stays unavailable and recovers on retry', async () => {
    jest.useFakeTimers();
    storage.set(REFRESH_TOKEN_KEY, 'refresh-old');
    api.refresh.mockRejectedValue(new authApi.AuthApiError(null));
    const store = createSessionStore();

    await restoreWithRetries(store);

    expect(api.refresh).toHaveBeenCalledTimes(RESTORE_ATTEMPTS);
    expect(store.getSnapshot()).toEqual({ status: 'offline', user: null });
    expect(storage.get(REFRESH_TOKEN_KEY)).toBe('refresh-old');

    api.refresh.mockReset();
    api.refresh.mockResolvedValue(session('new'));
    await store.retryRestore();

    expect(api.refresh).toHaveBeenCalledWith('refresh-old', expect.anything());
    expect(store.getSnapshot()).toEqual({ status: 'authenticated', user });
    expect(storage.get(REFRESH_TOKEN_KEY)).toBe('refresh-new');
  });

  it.each([429, 500, 503])('treats a %i from the refresh endpoint at startup as transient', async (status) => {
    jest.useFakeTimers();
    storage.set(REFRESH_TOKEN_KEY, 'refresh-old');
    api.refresh.mockRejectedValue(new authApi.AuthApiError(status));
    const store = createSessionStore();

    await restoreWithRetries(store);

    expect(store.getSnapshot().status).toBe('offline');
    expect(storage.get(REFRESH_TOKEN_KEY)).toBe('refresh-old');
  });

  it('shares a single refresh between the startup restore and a 401 retry', async () => {
    storage.set(REFRESH_TOKEN_KEY, 'refresh-old');
    const pending = deferred<authApi.AuthSession>();
    api.refresh.mockReturnValue(pending.promise);
    const store = createSessionStore();

    const restoring = store.restoreSession();
    const refreshing = store.tokenHandlers.refreshAccessToken();
    pending.resolve(session('new'));

    await expect(refreshing).resolves.toBe('access-new');
    await restoring;
    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toEqual({ status: 'authenticated', user });
  });

  it('holds authenticated requests until the startup restore finishes', async () => {
    storage.set(REFRESH_TOKEN_KEY, 'refresh-old');
    const pending = deferred<authApi.AuthSession>();
    api.refresh.mockReturnValue(pending.promise);
    const store = createSessionStore();
    const { client, fetchMock } = createTestClient(store, [200]);

    const restoring = store.restoreSession();
    const request = client.GET('/me');
    pending.resolve(session('new'));
    const { response } = await request;
    await restoring;

    expect(response.status).toBe(200);
    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer access-new');
  });

  it('sends requests without a token while anonymous', async () => {
    const store = createSessionStore();
    await store.restoreSession();
    const { client, fetchMock } = createTestClient(store, [200]);

    await client.GET('/me');

    expect(fetchMock.mock.calls[0][0].headers.get('Authorization')).toBeNull();
  });

  it('refreshes the access token through the api client handlers', async () => {
    const store = createSessionStore();
    await store.startSession(session('1'));
    api.refresh.mockResolvedValue(session('2'));

    const token = await store.tokenHandlers.refreshAccessToken();

    expect(api.refresh).toHaveBeenCalledWith('refresh-1', expect.anything());
    expect(token).toBe('access-2');
    expect(storage.get(REFRESH_TOKEN_KEY)).toBe('refresh-2');
  });

  it('clears the session when the refresh token is rejected', async () => {
    const store = createSessionStore();
    await store.startSession(session('1'));
    api.refresh.mockRejectedValue(new authApi.AuthApiError(401));

    expect(await store.tokenHandlers.refreshAccessToken()).toBeNull();

    expect(store.getSnapshot().status).toBe('anonymous');
    expect(storage.has(REFRESH_TOKEN_KEY)).toBe(false);
    expect(await store.tokenHandlers.getAccessToken()).toBeNull();
  });

  it('logs out when a request gets a 401 and the refresh token is rejected', async () => {
    const store = createSessionStore();
    await store.startSession(session('1'));
    api.refresh.mockRejectedValue(new authApi.AuthApiError(401));
    const { client } = createTestClient(store, [401]);

    const { response } = await client.GET('/me');

    expect(response.status).toBe(401);
    expect(store.getSnapshot().status).toBe('anonymous');
    expect(storage.has(REFRESH_TOKEN_KEY)).toBe(false);
  });

  it.each([null, 429, 503])('keeps the session when a refresh after a 401 fails with %p', async (status) => {
    const store = createSessionStore();
    await store.startSession(session('1'));
    api.refresh.mockRejectedValue(new authApi.AuthApiError(status));
    const { client, fetchMock } = createTestClient(store, [401]);

    const { response } = await client.GET('/me');

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toEqual({ status: 'authenticated', user });
    expect(storage.get(REFRESH_TOKEN_KEY)).toBe('refresh-1');
    expect(await store.tokenHandlers.getAccessToken()).toBe('access-1');
  });

  it('ignores a refresh that finishes after a newer session started', async () => {
    const store = createSessionStore();
    await store.startSession(session('1'));
    const pending = deferred<authApi.AuthSession>();
    api.refresh.mockReturnValue(pending.promise);

    const refreshing = store.tokenHandlers.refreshAccessToken();
    await store.startSession(session('2'));
    pending.resolve(session('stale'));

    await expect(refreshing).resolves.toBe('access-2');
    expect(storage.get(REFRESH_TOKEN_KEY)).toBe('refresh-2');
    expect(await store.tokenHandlers.getAccessToken()).toBe('access-2');
  });

  it('keeps a newer session when a stale refresh token is rejected', async () => {
    const store = createSessionStore();
    await store.startSession(session('1'));
    const pending = deferred<authApi.AuthSession>();
    api.refresh.mockReturnValue(pending.promise);

    const refreshing = store.tokenHandlers.refreshAccessToken();
    await store.startSession(session('2'));
    pending.reject(new authApi.AuthApiError(401));

    await expect(refreshing).resolves.toBe('access-2');
    expect(store.getSnapshot()).toEqual({ status: 'authenticated', user });
    expect(storage.get(REFRESH_TOKEN_KEY)).toBe('refresh-2');
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
