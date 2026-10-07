import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/ui/toast';
import type { AuthUser } from '@/features/auth/api/auth-api';
import { SessionContext, type SessionContextValue } from '@/features/auth/session/session-context';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export const testUser: AuthUser = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  role: 'DRIVER',
  emailVerified: false,
  hasPassword: true,
  paymentMode: 'TEST',
  locationMode: 'DEMO',
  autoRefund: false,
};

export function createSessionValue(overrides: Partial<SessionContextValue> = {}): SessionContextValue {
  return {
    status: 'anonymous',
    user: null,
    startSession: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn().mockResolvedValue(undefined),
    retryRestore: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  session: SessionContextValue = createSessionValue(),
  queryClient: QueryClient = createTestQueryClient(),
) {
  function Providers({ children }: PropsWithChildren) {
    return (
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <SessionContext value={session}>
            <ToastProvider>{children}</ToastProvider>
          </SessionContext>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  return render(ui, { wrapper: Providers });
}
