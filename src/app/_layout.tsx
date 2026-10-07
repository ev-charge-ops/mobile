import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { navigationTheme } from '@/constants/navigation-theme';
import { colors } from '@/constants/theme';
import { useSession } from '@/features/auth/session/session-context';
import { useReturnAfterSignIn } from '@/features/auth/session/use-return-after-sign-in';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { AppProviders } from '@/providers/app-providers';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </ThemeProvider>
    </AppProviders>
  );
}

function RootNavigator() {
  const [fontsLoaded, fontError] = useAppFonts();
  const { status } = useSession();
  const isReady = (fontsLoaded || fontError != null) && status !== 'loading';
  const isAuthenticated = status === 'authenticated';

  useReturnAfterSignIn(status);

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

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
