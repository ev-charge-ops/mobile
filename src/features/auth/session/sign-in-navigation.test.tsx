import { router } from 'expo-router';
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

jest.mock('@/features/home/components/home-charge-card', () => {
  const actual = jest.requireActual('@/features/home/components/home-charge-card');
  const { Text } = jest.requireActual('react-native');
  return {
    ...actual,
    HomeChargeCard: ({ charge }: { charge: { sessionId: string } }) => <Text>{`Sessão ${charge.sessionId}`}</Text>,
  };
});

const user = { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'DRIVER', emailVerified: true, hasPassword: true };
const openSession = {
  id: 'session-1',
  status: 'ACTIVE',
  chargePoint: { id: 'cp-1', code: 'L1-01', name: 'Garagem L1' },
  limit: { type: 'FULL', energyKwh: null, amountCents: null, socPercent: null },
  targetEnergyKwh: null,
  projectedChargingEndsAt: null,
  energyKwh: 1.5,
  powerKw: 7,
  socPercent: 40,
  totalCents: 134,
};
const organizations = [{ id: 'o1', name: 'Residencial Aclimação', type: 'CONDOMINIUM', role: 'DRIVER', unitLabel: 'B · 42' }];

const purposes = [
  {
    purpose: 'ESSENTIAL_SERVICE',
    required: true,
    title: 'Serviço de recarga',
    description: 'Identidade e sessões',
    granted: false,
    termsVersion: null,
    recordedAt: null,
  },
  {
    purpose: 'MARKETING_COMMUNICATIONS',
    required: false,
    title: 'Novidades do produto',
    description: 'Comunicados sobre novas funções',
    granted: false,
    termsVersion: null,
    recordedAt: null,
  },
];

function consents(mustAccept: boolean) {
  return { termsVersion: '2026-10-07', acceptedTermsVersion: mustAccept ? null : '2026-10-07', mustAccept, purposes };
}

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

jest.setTimeout(15000);

let app: ReturnType<typeof renderRouter>;

async function renderApp() {
  app = renderRouter('./src/app', { initialUrl: '/login' });
  await app;
  jest.useRealTimers();
  await flush();
}

async function signInToHome() {
  await renderApp();
  await signIn();
  expect(await screen.findByText('Olá, Ana')).toBeOnTheScreen();
}

async function signIn() {
  await fireEvent.changeText(await screen.findByLabelText('E-mail'), 'ana@example.com');
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
  jest.requireMock('@/lib/secure-storage').store.clear();
  api.routes.clear();
  api.native = true;
  mockHomeScreenFailure.enabled = false;
  mockRootFailure.enabled = false;
  setRoute('POST /auth/login', 200, { user, accessToken: 'access-1', refreshToken: 'refresh-1' });
  setRoute('POST /auth/logout', 204);
  setRoute('GET /auth/me', 200, user);
  setRoute('GET /me/organizations', 200, organizations);
  setRoute('GET /charge-points', 200, []);
  setRoute('GET /sessions/active', 200, { session: null });
  setRoute('GET /me/consents', 200, consents(false));
  setRoute('GET /me/notifications', 200, { items: [], total: 0, page: 1, pageSize: 20, unreadCount: 0 });
});

afterEach(() => {
  queryClient.clear();
  jest.useRealTimers();
});

describe('signing in', () => {
  it('shows the home tab when native fetch responses are not global Response instances', async () => {
    await renderApp();

    await signIn();

    expect(await screen.findByText('Olá, Ana')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Início' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Pontos' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Histórico' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Conta' })).toBeOnTheScreen();
    expect(screen.queryByRole('tab', { name: 'Recarga' })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Avisos' })).toBeNull();
    await flush(50);
    expect(screen.getByText('Olá, Ana')).toBeOnTheScreen();
  });

  it('asks for consent before showing the tabs when the terms must be accepted', async () => {
    setRoute('GET /me/consents', 200, consents(true));
    setRoute('PUT /me/consents', 200, consents(false));
    await renderApp();

    await signIn();

    expect(await screen.findByText('O que coletamos e por quê')).toBeOnTheScreen();
    expect(screen.queryByText('Olá, Ana')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Aceitar e continuar' }));

    expect(await screen.findByText('Olá, Ana')).toBeOnTheScreen();
  });

  it('opens the account tab', async () => {
    await signInToHome();

    await fireEvent.press(screen.getByRole('tab', { name: 'Conta' }));

    expect(await screen.findByText('Ana')).toBeOnTheScreen();
    expect(await screen.findByText('Residencial Aclimação · B · 42')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeOnTheScreen();
  });

  it('switches to the points tab', async () => {
    await signInToHome();

    await fireEvent.press(screen.getByRole('tab', { name: 'Pontos' }));

    expect(await screen.findByLabelText('Buscar ponto')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Pontos' })).toBeSelected();
  });

  it('opens the notices from the bell and goes back', async () => {
    await signInToHome();

    await fireEvent.press(screen.getByRole('button', { name: 'Avisos' }));

    expect(await screen.findByText('Nenhum aviso por enquanto')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/notifications');

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(await screen.findByText('Olá, Ana')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/');
  });

  it('sends the charging action to the points tab when no session is open', async () => {
    await signInToHome();

    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar recarga' }));

    expect(await screen.findByLabelText('Buscar ponto')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/points');
  });

  it('sends the charging action to the open session', async () => {
    setRoute('GET /sessions/active', 200, { session: openSession });
    await signInToHome();

    expect(await screen.findByText('Sessão session-1')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Recarga em andamento' }));
    await flush();

    expect(app.getPathname()).toBe('/sessions/session-1');
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

describe('deep links', () => {
  it.each(['/reset-password', '/verify-email', '/login/email', '/invite'])('keeps %s reachable when signed out', async (path) => {
    const view = renderRouter('./src/app', { initialUrl: `${path}?token=abc` });
    await view;
    jest.useRealTimers();
    await flush();

    expect(view.getPathname()).toBe(path);
  });

  it('sends a signed out visitor of the tabs to the login', async () => {
    await renderRouter('./src/app', { initialUrl: '/points' });
    jest.useRealTimers();
    await flush();

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeOnTheScreen();
  });
});

describe('push notification targets', () => {
  it('opens an organization invite on the account tab', async () => {
    await signInToHome();

    await act(async () => {
      router.push('/account');
    });

    expect(await screen.findByRole('button', { name: 'Sair' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Conta' })).toBeSelected();
    expect(app.getPathname()).toBe('/account');
  });

  it('opens the notices as a stack screen', async () => {
    await signInToHome();

    await act(async () => {
      router.push('/notifications');
    });

    expect(await screen.findByText('Nenhum aviso por enquanto')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/notifications');
  });

  it('opens the charge point of a queue turn and the session of a charging notice', async () => {
    await signInToHome();

    await act(async () => {
      router.push({ pathname: '/charge-points/[chargePointId]', params: { chargePointId: 'cp-1' } });
    });
    expect(app.getPathname()).toBe('/charge-points/cp-1');

    await act(async () => {
      router.push({ pathname: '/sessions/[sessionId]', params: { sessionId: 'session-1' } });
    });
    expect(app.getPathname()).toBe('/sessions/session-1');
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
