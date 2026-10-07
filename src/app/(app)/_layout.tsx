import { useQueryClient } from '@tanstack/react-query';
import { Stack, type ErrorBoundaryProps } from 'expo-router';

import { colors } from '@/constants/theme';
import { SignedInErrorScreen } from '@/features/auth/screens/signed-in-error-screen';
import { chargePointsQueryKey } from '@/features/charging/api/use-charge-points';
import { sessionsQueryKey } from '@/features/charging/api/use-charging-sessions';
import { useSessionReminders } from '@/features/charging/use-session-reminders';
import { usePushNotifications } from '@/features/notifications/hooks/use-push-notifications';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <SignedInErrorScreen details={__DEV__ ? error.message : null} onRetry={retry} />;
}

export default function AppLayout() {
  const queryClient = useQueryClient();

  usePushNotifications({
    onRefresh: () => {
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
      queryClient.invalidateQueries({ queryKey: chargePointsQueryKey });
    },
  });
  useSessionReminders();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBase } }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="charge-points/[chargePointId]" />
      <Stack.Screen name="sessions/[sessionId]" />
      <Stack.Screen name="account" />
      <Stack.Screen name="showcase" />
    </Stack>
  );
}
