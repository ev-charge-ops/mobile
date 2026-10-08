import { useQueryClient } from '@tanstack/react-query';
import { Stack, type ErrorBoundaryProps } from 'expo-router';

import { LoadingScreen } from '@/components/ui/loading-screen';
import { colors, motion } from '@/constants/theme';
import { useDeletedAccountSignOut } from '@/features/auth/api/use-deleted-account-sign-out';
import { useLogout } from '@/features/auth/api/use-logout';
import { useMe } from '@/features/auth/api/use-me';
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

const pushTransition = { animation: 'slide_from_right', animationDuration: motion.duration.slow } as const;

export default function AppLayout() {
  const consentsQuery = useMyConsents();
  const logout = useLogout();
  const signOutDeletedAccount = useDeletedAccountSignOut();
  const { data: user } = useMe();

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
    return (
      <ConsentScreen
        mode="gate"
        hasPassword={user?.hasPassword ?? true}
        onSignOut={() => logout.mutate()}
        onAccountDeleted={signOutDeletedAccount}
      />
    );
  }

  return (
    <>
      <SignedInServices />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBase } }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="charge-points/[chargePointId]"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            animationDuration: motion.duration.slow,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen name="sessions/[sessionId]" options={pushTransition} />
        <Stack.Screen name="notifications" options={pushTransition} />
        <Stack.Screen name="privacy" options={pushTransition} />
        <Stack.Screen name="profile" />
        <Stack.Screen name="change-password" />
      </Stack>
    </>
  );
}
