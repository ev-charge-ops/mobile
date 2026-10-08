import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, screen } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/ui/toast';
import { useDeletedAccountSignOut } from '@/features/auth/api/use-deleted-account-sign-out';
import { SessionContext } from '@/features/auth/session/session-context';
import { createSessionValue } from '@/features/auth/testing/render-with-providers';

jest.mock('@/features/auth/oauth/google-sign-in', () => ({ signOutFromGoogle: jest.fn() }));
jest.mock('@/lib/push-notifications', () => ({ unregisterDevicePushToken: jest.fn() }));
jest.mock('@/lib/scheduled-reminders', () => ({ cancelAllScheduledReminders: jest.fn() }));

describe('useDeletedAccountSignOut', () => {
  it('ends the local session and confirms the deletion', async () => {
    const session = createSessionValue({ status: 'authenticated' });
    const queryClient = new QueryClient();

    function Providers({ children }: PropsWithChildren) {
      return (
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 0, left: 0, right: 0, bottom: 0 },
          }}
        >
          <QueryClientProvider client={queryClient}>
            <SessionContext value={session}>
              <ToastProvider>
                <Text>app</Text>
                {children}
              </ToastProvider>
            </SessionContext>
          </QueryClientProvider>
        </SafeAreaProvider>
      );
    }

    const { result } = await renderHook(() => useDeletedAccountSignOut(), { wrapper: Providers });
    await act(async () => result.current());

    expect(session.endSession).toHaveBeenCalled();
    expect(await screen.findByText('Conta excluída')).toBeOnTheScreen();
  });
});
