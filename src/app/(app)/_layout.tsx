import { useQueryClient } from '@tanstack/react-query';
import { Stack, type ErrorBoundaryProps } from 'expo-router';

import { LoadingScreen } from '@/components/ui/loading-screen';
import { colors } from '@/constants/theme';
import { useLogout } from '@/features/auth/api/use-logout';
import { SignedInErrorScreen } from '@/features/auth/screens/signed-in-error-screen';
import { chargePointsQueryKey } from '@/features/charging/api/use-charge-points';
import { sessionsQueryKey } from '@/features/charging/api/use-charging-sessions';
import { useSessionReminders } from '@/features/charging/use-session-reminders';
import { usePushNotifications } from '@/features/notifications/hooks/use-push-notifications';
import { useMyConsents } from '@/features/privacy/api/use-privacy';
import { ConsentScreen } from '@/features/privacy/screens/consent-screen';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <SignedInErrorScreen details={__DEV__ ? error.message : null} onRetry={retry} />;
}

function SignedInServices() {
  const queryClient = useQueryClient();

  usePushNotifications({
    onRefresh: () => {
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
      queryClient.invalidateQueries({ queryKey: chargePointsQueryKey });
    },
  });
  useSessionReminders();

  return null;
}

export default function AppLayout() {
  const consentsQuery = useMyConsents();
  const logout = useLogout();

  if (!consentsQuery.data) {
    if (consentsQuery.isError) {
      return (
        <SignedInErrorScreen
          message="Não foi possível carregar seus consentimentos. Verifique sua conexão e tente novamente."
          onRetry={() => consentsQuery.refetch()}
          isRetrying={consentsQuery.isFetching}
        />
      );
    }
    return <LoadingScreen label="Carregando sua conta" />;
  }

  if (consentsQuery.data.mustAccept) {
    return <ConsentScreen mode="gate" onSignOut={() => logout.mutate()} />;
  }

  return (
    <>
      <SignedInServices />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBase } }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="charge-points/[chargePointId]" />
        <Stack.Screen name="sessions/[sessionId]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="change-password" />
      </Stack>
    </>
  );
}
