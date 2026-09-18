import { Stack, type ErrorBoundaryProps } from 'expo-router';

import { colors } from '@/constants/theme';
import { SignedInErrorScreen } from '@/features/auth/screens/signed-in-error-screen';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <SignedInErrorScreen details={__DEV__ ? error.message : null} onRetry={retry} />;
}

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBase } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="showcase" />
    </Stack>
  );
}
