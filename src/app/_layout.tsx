import { Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';

import { navigationTheme } from '@/constants/navigation-theme';
import { colors } from '@/constants/theme';
import { OpeningScreen } from '@/features/auth/screens/opening-screen';
import { OfflineSessionScreen } from '@/features/auth/screens/offline-session-screen';
import { RootErrorScreen } from '@/features/auth/screens/root-error-screen';
import { useSession } from '@/features/auth/session/session-context';
import type { SessionStatus } from '@/features/auth/session/session-store';
import { useReturnAfterSignIn } from '@/features/auth/session/use-return-after-sign-in';
import { getSessionAlertKey } from '@/features/notifications/notification-routing';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { configureNotificationHandler } from '@/lib/push-notifications';
import { AppProviders } from '@/providers/app-providers';

SplashScreen.preventAutoHideAsync();
configureNotificationHandler(getSessionAlertKey);

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <RootErrorScreen details={__DEV__ ? error.message : null} onRetry={retry} />;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="dark" />
        <RootNavigator />
      </ThemeProvider>
    </AppProviders>
  );
}

function RootNavigator() {
  const [fontsLoaded, fontError] = useAppFonts();
  const { status } = useSession();
  const [showOpening, setShowOpening] = useState(true);
  const fontsReady = fontsLoaded || fontError != null;
  const isReady = fontsReady && status !== 'loading';
  const hideOpening = useCallback(() => setShowOpening(false), []);

  useReturnAfterSignIn(status);

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <>
      {isReady ? <AppNavigator status={status} /> : null}
      {showOpening ? <OpeningScreen ready={isReady} onDone={hideOpening} /> : null}
    </>
  );
}

function AppNavigator({ status }: { status: SessionStatus }) {
  const isAuthenticated = status === 'authenticated';

  if (status === 'offline') return <OfflineSessionScreen />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBase } }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="login/email" />
      <Stack.Screen name="invite" />
    </Stack>
  );
}
