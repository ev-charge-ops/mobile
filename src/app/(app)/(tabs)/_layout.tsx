import { router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { CircleUserRound, House, Map, Receipt } from 'lucide-react-native';

import { LoadingScreen } from '@/components/ui/loading-screen';
import { TabBar, type TabBarAction, type TabBarItem } from '@/components/ui/tab-bar';
import { colors } from '@/constants/theme';
import { useMe } from '@/features/auth/api/use-me';
import { SignedInErrorScreen } from '@/features/auth/screens/signed-in-error-screen';
import { hasOpenSession, useActiveSession } from '@/features/charging/api/use-charging-sessions';

export default function TabsLayout() {
  const meQuery = useMe();
  const { data: activeSession } = useActiveSession();
  const openSession = hasOpenSession(activeSession) ? activeSession : null;

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
    { name: 'index', label: 'Início', icon: House },
    { name: 'points', label: 'Pontos', icon: Map, night: true },
    { name: 'history', label: 'Histórico', icon: Receipt },
    {
      name: 'account',
      label: 'Conta',
      icon: CircleUserRound,
      badge: !meQuery.data.emailVerified,
      badgeLabel: 'ação pendente',
    },
  ];

  const action: TabBarAction = openSession
    ? {
        accessibilityLabel: 'Recarga em andamento',
        live: true,
        onPress: () => router.push({ pathname: '/sessions/[sessionId]', params: { sessionId: openSession.id } }),
      }
    : {
        accessibilityLabel: 'Iniciar recarga',
        onPress: () => router.navigate('/points'),
      };

  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bgBase } }}
      tabBar={(props) => <TabBar {...props} items={items} action={action} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="points" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
