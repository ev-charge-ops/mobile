import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { queryClient } from '@/lib/react-query';

const mockRootFailure = { enabled: false };

jest.mock('@/hooks/use-app-fonts', () => ({
  useAppFonts: () => {
    if (mockRootFailure.enabled) throw new Error('Root failed to render');
    return [true, null];
  },
}));

jest.mock('@/lib/secure-storage', () => {
  const store = new Map<string, string>();
  return {
    store,
    getSecureItem: jest.fn(async (key: string) => store.get(key) ?? null),
    setSecureItem: jest.fn(async (key: string, value: string) => void store.set(key, value)),
    deleteSecureItem: jest.fn(async (key: string) => void store.delete(key)),
  };
});

const mockHomeScreenFailure = { enabled: false };

jest.mock('@/features/home/screens/home-screen', () => {
  const actual = jest.requireActual('@/features/home/screens/home-screen');
  return {
    HomeScreen: (props: object) => {
      if (mockHomeScreenFailure.enabled) throw new Error('Home failed to render');
      return actual.HomeScreen(props);
    },
  };
});

const user = { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'DRIVER', emailVerified: true };
const organizations = [{ id: 'o1', name: 'Residencial Aclimação', type: 'CONDOMINIUM', role: 'DRIVER', unitLabel: 'B · 42' }];

class NativeFetchResponse {
  readonly headers = new Headers({ 'Content-Type': 'application/json' });
  readonly statusText = '';

  constructor(
    private readonly body: string,
    readonly status: number,
  ) {}

  get ok() {
    return this.status >= 200 && this.status < 300;
  }

  get [Symbol.toStringTag]() {
    return 'Response';
  }

  async text() {
    return this.body;
  }

  async json() {
    return JSON.parse(this.body);
  }
}

type Route = { status: number; body: unknown };

const api = {
  routes: new Map<string, Route>(),
  native: true,
};

function reply({ status, body }: Route) {
  const text = JSON.stringify(body);
  if (api.native) return new NativeFetchResponse(text, status) as unknown as Response;
  return new Response(text, { status, headers: { 'Content-Type': 'application/json' } });
}

globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
  const request = input instanceof Request ? input : new Request(input);
  const route = api.routes.get(`${request.method} ${new URL(request.url).pathname}`);
  return reply(route ?? { status: 404, body: {} });
}) as typeof fetch;

function setRoute(key: string, status: number, body: unknown = {}) {
  api.routes.set(key, { status, body });
}

async function flush(ms = 0) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

async function renderApp() {
  await renderRouter('./src/app', { initialUrl: '/login' });
  jest.useRealTimers();
  await flush();
}

async function signIn() {
  await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@example.com');
  await fireEvent.changeText(screen.getByLabelText('Senha'), 'secret-password');
  await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
}

beforeAll(() => {
  const defaults = queryClient.getDefaultOptions();
  queryClient.setDefaultOptions({
    queries: { ...defaults.queries, gcTime: Infinity },
    mutations: { ...defaults.mutations, gcTime: Infinity },
  });
});

beforeEach(() => {
  api.routes.clear();
  api.native = true;
  mockHomeScreenFailure.enabled = false;
  mockRootFailure.enabled = false;
  setRoute('POST /auth/login', 200, { user, accessToken: 'access-1', refreshToken: 'refresh-1' });
  setRoute('POST /auth/logout', 204);
  setRoute('GET /auth/me', 200, user);
  setRoute('GET /me/organizations', 200, organizations);
});

afterEach(() => {
  queryClient.clear();
  jest.useRealTimers();
});

describe('signing in', () => {
  it('shows home when native fetch responses are not global Response instances', async () => {
    await renderApp();

    await signIn();

    expect(await screen.findByText('Olá, Ana')).toBeOnTheScreen();
    expect(await screen.findByText('Residencial Aclimação')).toBeOnTheScreen();
    await flush(50);
    expect(screen.getByText('Olá, Ana')).toBeOnTheScreen();
  });

  it('shows an error with retry when the profile cannot be loaded', async () => {
    setRoute('GET /auth/me', 500);
    await renderApp();

    await signIn();

    expect(await screen.findByText('Algo deu errado', {}, { timeout: 5000 })).toBeOnTheScreen();
    expect(screen.getByText(/Não foi possível carregar sua conta/)).toBeOnTheScreen();

    setRoute('GET /auth/me', 200, user);
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Olá, Ana')).toBeOnTheScreen();
  });

  it('shows the error boundary instead of a blank screen when home fails to render', async () => {
    mockHomeScreenFailure.enabled = true;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await renderApp();

    await signIn();

    expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Sair' }));

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeOnTheScreen();
  });
});

describe('root error boundary', () => {
  it('ends the stored session and returns to sign in when choosing to sign out', async () => {
    const { store } = jest.requireMock('@/lib/secure-storage');
    store.set('auth.refreshToken', 'refresh-1');
    mockRootFailure.enabled = true;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await renderApp();

    expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();

    mockRootFailure.enabled = false;
    await fireEvent.press(screen.getByRole('button', { name: 'Sair' }));

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeOnTheScreen();
    expect(store.has('auth.refreshToken')).toBe(false);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', url: expect.stringContaining('/auth/logout') }),
      undefined,
    );
  });
});
