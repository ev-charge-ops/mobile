import { Tabs } from 'expo-router/js-tabs';
import { Bell, MapPin, Receipt, Zap } from 'lucide-react-native';

import { LoadingScreen } from '@/components/ui/loading-screen';
import { TabBar, type TabBarItem } from '@/components/ui/tab-bar';
import { colors } from '@/constants/theme';
import { useMe } from '@/features/auth/api/use-me';
import { SignedInErrorScreen } from '@/features/auth/screens/signed-in-error-screen';
import { useHasActiveSession } from '@/features/charging/api/use-charging-sessions';

export default function TabsLayout() {
  const meQuery = useMe();
  const hasActiveSession = useHasActiveSession();

  if (!meQuery.data) {
    if (meQuery.isError) {
      return (
        <SignedInErrorScreen
          message="Não foi possível carregar sua conta. Verifique sua conexão e tente novamente."
          onRetry={() => meQuery.refetch()}
          isRetrying={meQuery.isFetching}
        />
      );
    }
    return <LoadingScreen label="Carregando sua conta" />;
  }

  const items: TabBarItem[] = [
    { name: 'index', label: 'Buscar', icon: MapPin },
    { name: 'charging', label: 'Recarga', icon: Zap, badge: hasActiveSession, badgeLabel: 'sessão em andamento' },
    { name: 'history', label: 'Histórico', icon: Receipt },
    { name: 'notifications', label: 'Avisos', icon: Bell },
  ];

  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bgBase } }}
      tabBar={(props) => <TabBar {...props} items={items} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="charging" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="notifications" />
    </Tabs>
  );
}
