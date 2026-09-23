import { fireEvent, render, screen } from '@testing-library/react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Bell, MapPin, Zap } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TabBar, type TabBarItem } from '@/components/ui/tab-bar';
import { haptics } from '@/lib/haptics';

jest.mock('@/lib/haptics', () => ({ haptics: { selection: jest.fn() } }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 34 },
};

const routes = [
  { key: 'index-key', name: 'index' },
  { key: 'charging-key', name: 'charging' },
  { key: 'notifications-key', name: 'notifications' },
];

async function renderTabBar({ index = 0, badge = false, defaultPrevented = false } = {}) {
  const navigation = {
    emit: jest.fn(() => ({ defaultPrevented })),
    navigate: jest.fn(),
  };
  const items: TabBarItem[] = [
    { name: 'index', label: 'Buscar', icon: MapPin },
    { name: 'charging', label: 'Recarga', icon: Zap, badge, badgeLabel: 'sessão em andamento' },
    { name: 'notifications', label: 'Avisos', icon: Bell },
  ];
  const props = {
    state: { index, routes, key: 'tabs', routeNames: routes.map((route) => route.name), type: 'tab', stale: false },
    navigation,
    descriptors: {},
    insets: metrics.insets,
  } as unknown as BottomTabBarProps;

  const view = await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <TabBar {...props} items={items} />
    </SafeAreaProvider>,
  );
  return { ...view, navigation };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<TabBar />', () => {
  it('renders the tabs and marks the active one', async () => {
    await renderTabBar({ index: 1 });

    expect(screen.getByRole('tab', { name: 'Buscar' })).not.toBeSelected();
    expect(screen.getByRole('tab', { name: 'Recarga' })).toBeSelected();
    expect(screen.getByText('Avisos')).toBeOnTheScreen();
  });

  it('shows the charging badge only while a session is active', async () => {
    const { rerender, navigation } = await renderTabBar({ badge: true });

    expect(screen.getByTestId('tab-badge-charging')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Recarga, sessão em andamento' })).toBeOnTheScreen();
    expect(navigation.navigate).not.toHaveBeenCalled();

    await rerender(
      <SafeAreaProvider initialMetrics={metrics}>
        <TabBar
          {...({
            state: { index: 0, routes, key: 'tabs', routeNames: [], type: 'tab', stale: false },
            navigation,
            descriptors: {},
            insets: metrics.insets,
          } as unknown as BottomTabBarProps)}
          items={[{ name: 'charging', label: 'Recarga', icon: Zap, badge: false }]}
        />
      </SafeAreaProvider>,
    );

    expect(screen.queryByTestId('tab-badge-charging')).not.toBeOnTheScreen();
  });

  it('navigates to another tab with haptic feedback', async () => {
    const { navigation } = await renderTabBar();

    await fireEvent.press(screen.getByRole('tab', { name: 'Avisos' }));

    expect(haptics.selection).toHaveBeenCalled();
    expect(navigation.emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'notifications-key',
      canPreventDefault: true,
    });
    expect(navigation.navigate).toHaveBeenCalledWith('notifications', undefined);
  });

  it('does not navigate when pressing the active tab or when prevented', async () => {
    const { navigation } = await renderTabBar({ defaultPrevented: true });

    await fireEvent.press(screen.getByRole('tab', { name: 'Buscar' }));
    await fireEvent.press(screen.getByRole('tab', { name: 'Recarga' }));

    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
