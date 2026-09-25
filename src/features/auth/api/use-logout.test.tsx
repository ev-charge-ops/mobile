import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { useLogout } from '@/features/auth/api/use-logout';
import { signOutFromGoogle } from '@/features/auth/oauth/google-sign-in';
import { SessionContext } from '@/features/auth/session/session-context';
import { createSessionValue } from '@/features/auth/testing/render-with-providers';
import { unregisterDevicePushToken } from '@/lib/push-notifications';
import { cancelAllScheduledReminders } from '@/lib/scheduled-reminders';

jest.mock('@/features/auth/oauth/google-sign-in', () => ({ signOutFromGoogle: jest.fn() }));
jest.mock('@/lib/push-notifications', () => ({ unregisterDevicePushToken: jest.fn() }));
jest.mock('@/lib/scheduled-reminders', () => ({ cancelAllScheduledReminders: jest.fn() }));

describe('useLogout', () => {
  it('removes the push token before ending the session and signs out of google', async () => {
    const calls: string[] = [];
    jest.mocked(unregisterDevicePushToken).mockImplementation(async () => {
      calls.push('push');
    });
    const session = createSessionValue({
      status: 'authenticated',
      endSession: jest.fn(async () => {
        calls.push('session');
      }),
    });
    const queryClient = new QueryClient();

    function Providers({ children }: PropsWithChildren) {
      return (
        <QueryClientProvider client={queryClient}>
          <SessionContext value={session}>{children}</SessionContext>
        </QueryClientProvider>
      );
    }

    const { result } = await renderHook(() => useLogout(), { wrapper: Providers });
    await act(() => result.current.mutateAsync());

    expect(session.endSession).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['push', 'session']);
    expect(cancelAllScheduledReminders).toHaveBeenCalledTimes(1);
    expect(signOutFromGoogle).toHaveBeenCalledTimes(1);
  });
});
