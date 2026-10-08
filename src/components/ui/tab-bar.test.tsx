import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { CircleUserRound, House, Map, Receipt } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { setTabSchemeOverride, TabBar, type TabBarAction, type TabBarItem } from '@/components/ui/tab-bar';
import { colors, nightColors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

jest.mock('@/lib/haptics', () => ({ haptics: { selection: jest.fn(), impactLight: jest.fn() } }));

const mockGlass = { available: false };

jest.mock('expo-glass-effect', () => {
  const { View } = jest.requireActual('react-native');
  return { GlassView: View, isLiquidGlassAvailable: () => mockGlass.available };
});

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 34 },
};

const routes = [
  { key: 'index-key', name: 'index' },
  { key: 'points-key', name: 'points' },
  { key: 'history-key', name: 'history' },
  { key: 'account-key', name: 'account' },
];

type RenderOptions = {
  index?: number;
  badge?: boolean;
  defaultPrevented?: boolean;
  action?: TabBarAction;
};

async function renderTabBar({ index = 0, badge = false, defaultPrevented = false, action }: RenderOptions = {}) {
  const navigation = {
    emit: jest.fn(() => ({ defaultPrevented })),
    navigate: jest.fn(),
  };
  const items: TabBarItem[] = [
    { name: 'index', label: 'Início', icon: House },
    { name: 'points', label: 'Pontos', icon: Map, night: true },
    { name: 'history', label: 'Histórico', icon: Receipt },
    { name: 'account', label: 'Conta', icon: CircleUserRound, badge, badgeLabel: 'ação pendente' },
  ];
  const props = {
    state: { index, routes, key: 'tabs', routeNames: routes.map((route) => route.name), type: 'tab', stale: false },
    navigation,
    descriptors: {},
    insets: metrics.insets,
  } as unknown as BottomTabBarProps;

  const view = await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <TabBar {...props} items={items} action={action} />
    </SafeAreaProvider>,
  );
  return { ...view, navigation };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGlass.available = false;
});

describe('<TabBar />', () => {
  it('shows the label only on the active tab', async () => {
    await renderTabBar({ index: 0 });

    expect(screen.getByRole('tab', { name: 'Início' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Pontos' })).not.toBeSelected();
    expect(screen.getByText('Início')).toBeOnTheScreen();
    expect(screen.queryByText('Pontos')).toBeNull();
    expect(screen.getByTestId('tab-index')).toHaveStyle({ backgroundColor: colors.accent });
  });

  it('floats above the bottom safe area', async () => {
    await renderTabBar();

    expect(screen.getByTestId('tab-bar')).toHaveStyle({ bottom: 34 });
  });

  it('uses the translucent light variant by default', async () => {
    await renderTabBar({ index: 2 });

    expect(screen.getByTestId('tab-bar-light')).toHaveStyle({ backgroundColor: colors.surfaceNav });
  });

  it('lets the liquid glass show through when available', async () => {
    mockGlass.available = true;
    await renderTabBar({ index: 2 });

    expect(screen.getByTestId('tab-bar-light')).not.toHaveStyle({ backgroundColor: colors.surfaceNav });
  });

  it('switches to the night variant on night routes', async () => {
    await renderTabBar({ index: 1 });

    expect(screen.getByTestId('tab-bar-night')).toHaveStyle({ backgroundColor: nightColors.surfaceNav });
    expect(screen.getByTestId('tab-points')).toHaveStyle({ backgroundColor: nightColors.accent });
  });

  it('follows the scheme a screen sets for its own tab', async () => {
    await renderTabBar({ index: 1 });

    await act(() => setTabSchemeOverride('points', 'light'));
    expect(screen.getByTestId('tab-bar-light')).toBeOnTheScreen();

    await act(() => setTabSchemeOverride('points', null));
    expect(screen.getByTestId('tab-bar-night')).toBeOnTheScreen();
  });

  it('shows the pending badge on a tab', async () => {
    await renderTabBar({ badge: true });

    expect(screen.getByTestId('tab-badge-account')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Conta, ação pendente' })).toBeOnTheScreen();
  });

  it('navigates to another tab with haptic feedback', async () => {
    const { navigation } = await renderTabBar();

    await fireEvent.press(screen.getByRole('tab', { name: 'Histórico' }));

    expect(haptics.selection).toHaveBeenCalled();
    expect(navigation.emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'history-key', canPreventDefault: true });
    expect(navigation.navigate).toHaveBeenCalledWith('history', undefined);
  });

  it('does not navigate when pressing the active tab or when prevented', async () => {
    const { navigation } = await renderTabBar({ defaultPrevented: true });

    await fireEvent.press(screen.getByRole('tab', { name: 'Início' }));
    await fireEvent.press(screen.getByRole('tab', { name: 'Pontos' }));

    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('renders the charging action and runs it on press', async () => {
    const onPress = jest.fn();
    await renderTabBar({ action: { accessibilityLabel: 'Iniciar recarga', onPress } });

    expect(screen.queryByTestId('tab-bar-action-live')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar recarga' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('marks the charging action as live during a session', async () => {
    await renderTabBar({ action: { accessibilityLabel: 'Recarga em andamento', live: true, onPress: jest.fn() } });

    expect(screen.getByTestId('tab-bar-action-live')).toBeOnTheScreen();
    expect(screen.getByTestId('tab-bar-action')).toHaveStyle({ backgroundColor: colors.surfaceInverse });
  });

  it('inverts the charging action on night routes', async () => {
    await renderTabBar({ index: 1, action: { accessibilityLabel: 'Iniciar recarga', onPress: jest.fn() } });

    expect(screen.getByTestId('tab-bar-action')).toHaveStyle({ backgroundColor: nightColors.surfaceInverse });
  });
});
