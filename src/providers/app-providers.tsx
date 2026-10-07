import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient, subscribeToAppFocus } from '@/lib/react-query';

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => subscribeToAppFocus(), []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}
