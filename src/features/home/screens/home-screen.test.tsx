import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AccessibilityInfo, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { toHomeCharge, toHomePoint, type HomeCharge, type HomePoint } from '@/features/home/home-summary';
import { HomeScreen, type HomeScreenProps } from '@/features/home/screens/home-screen';
import { buildHomeChargePoint, buildHomeSession } from '@/features/home/testing/home-fixtures';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn() },
  useIsFocused: () => true,
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const now = Date.parse('2026-10-07T14:00:00.000Z');

const activeCharge = toHomeCharge(
  buildHomeSession({
    limit: { type: 'PERCENT', socPercent: 80, energyKwh: null, amountCents: null },
    projectedChargingEndsAt: '2026-10-07T14:42:00.000Z',
    socPercent: 68,
  }),
  now,
) as HomeCharge;

const points: HomePoint[] = [
  toHomePoint(buildHomeChargePoint(), '40 m'),
  toHomePoint(
    buildHomeChargePoint({ id: 'cp-2', code: 'L2-01', name: 'Visitantes', photoUrl: 'https://cdn.example/l2.webp' }),
    null,
  ),
];

async function renderHome(overrides: Partial<HomeScreenProps> = {}) {
  const props: HomeScreenProps = {
    greeting: 'Olá, Ana',
    initials: 'AS',
    subtitle: 'Residencial Aclimação · B · 42',
    actions: <Text>Sino</Text>,
    charge: activeCharge,
    isChargeLoading: false,
    points,
    isPointsLoading: false,
    onRefresh: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  await render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <HomeScreen {...props} />
    </SafeAreaProvider>,
  );
  return props;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<HomeScreen />', () => {
  it('greets the driver and opens the account from the avatar', async () => {
    await renderHome();

    expect(screen.getByText('Olá, Ana')).toBeOnTheScreen();
    expect(screen.getByText('Residencial Aclimação · B · 42')).toBeOnTheScreen();
    expect(screen.getByText('Sino')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Abrir conta' }));
    expect(router.navigate).toHaveBeenCalledWith('/account');
  });

  it('shows the active charge with the live hero and opens the session', async () => {
    await renderHome();

    expect(screen.getByText('Recarga em andamento')).toBeOnTheScreen();
    expect(screen.getByText('Limite 80% · cerca de 42 min')).toBeOnTheScreen();
    expect(screen.getByText('68')).toBeOnTheScreen();
    expect(screen.getByText('Carregando')).toBeOnTheScreen();
    expect(screen.getByText('L1-01 · Vaga 12')).toBeOnTheScreen();
    expect(screen.getByTestId('progress-meter-limit')).toBeOnTheScreen();
    expect(await screen.findByTestId('home-hero-video')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('home-charge-card'));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/sessions/[sessionId]', params: { sessionId: 'session-1' } });
  });

  it('keeps the poster still when the system asks for reduced motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

    await renderHome();

    expect(await screen.findByTestId('home-hero-poster')).toBeOnTheScreen();
    expect(screen.queryByTestId('home-hero-video')).toBeNull();
  });

  it('shows the empty state and the studio image without a session', async () => {
    await renderHome({ charge: null });

    expect(screen.getByText('Nenhuma recarga ativa')).toBeOnTheScreen();
    expect(screen.getByTestId('home-hero-image')).toBeOnTheScreen();
    expect(screen.queryByTestId('home-hero-video')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Encontrar um ponto' }));
    expect(router.navigate).toHaveBeenCalledWith('/points');
  });

  it('lists the condo points with photo or placeholder', async () => {
    await renderHome();

    expect(screen.getByText('L1-02 · Vaga 13')).toBeOnTheScreen();
    expect(screen.getByText('40 m')).toBeOnTheScreen();
    expect(screen.getAllByText('Livre')).toHaveLength(2);
    expect(screen.getByTestId('home-point-placeholder')).toBeOnTheScreen();
    expect(screen.getByTestId('home-point-photo')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('home-point-cp-2'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/charge-points/[chargePointId]',
      params: { chargePointId: 'cp-2' },
    });

    await fireEvent.press(screen.getByRole('link', { name: 'Ver mapa' }));
    expect(router.navigate).toHaveBeenCalledWith('/points');
  });

  it('explains when there are no points yet', async () => {
    await renderHome({ points: [] });

    expect(screen.getByText('Nenhum ponto de recarga disponível por aqui ainda.')).toBeOnTheScreen();
  });

  it('refreshes everything on pull', async () => {
    const props = await renderHome();

    const { onRefresh } = screen.getByTestId('home-scroll').props.refreshControl.props as {
      onRefresh: () => Promise<void>;
    };
    await onRefresh();

    expect(props.onRefresh).toHaveBeenCalled();
  });
});
