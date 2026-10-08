import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, renderHook, screen } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/ui/toast';
import * as notificationsApi from '@/features/notifications/api/notifications-api';
import { notificationsQueryKey } from '@/features/notifications/api/use-notifications';
import {
  NOTIFICATION_TOAST_DURATION_MS,
  usePushNotifications,
} from '@/features/notifications/hooks/use-push-notifications';
import { registerDevicePushToken } from '@/lib/push-notifications';

jest.mock('expo-notifications', () => ({
  DEFAULT_ACTION_IDENTIFIER: 'expo.modules.notifications.actions.DEFAULT',
  getLastNotificationResponse: jest.fn(),
  clearLastNotificationResponseAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
}));

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

jest.mock('@/lib/push-notifications', () => ({
  isPushSupported: () => true,
  registerDevicePushToken: jest.fn(),
  shouldPresentAlert: jest.requireActual('@/lib/push-notifications').shouldPresentAlert,
}));

jest.mock('@/features/notifications/api/notifications-api', () => ({
  listMyNotifications: jest.fn(),
  markNotificationRead: jest.fn(),
  markAllNotificationsRead: jest.fn(),
}));

const notifications = jest.mocked(Notifications);
const api = jest.mocked(notificationsApi);

let responseListener: ((response: Notifications.NotificationResponse) => void) | null = null;
let receivedListener: ((notification: Notifications.Notification) => void) | null = null;

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function buildNotification(identifier: string, content: Record<string, unknown>) {
  return { request: { identifier, content } } as unknown as Notifications.Notification;
}

function buildResponse(identifier: string, data: Record<string, unknown>, actionIdentifier?: string) {
  return {
    actionIdentifier: actionIdentifier ?? Notifications.DEFAULT_ACTION_IDENTIFIER,
    notification: { request: { identifier, content: { data } } },
  } as unknown as Notifications.NotificationResponse;
}

async function renderPush(onRefresh = jest.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

  function Providers({ children }: PropsWithChildren) {
    return (
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  const view = await renderHook(() => usePushNotifications({ onRefresh }), { wrapper: Providers });
  return { ...view, invalidate, onRefresh };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  responseListener = null;
  receivedListener = null;
  notifications.getLastNotificationResponse.mockReturnValue(null);
  notifications.clearLastNotificationResponseAsync.mockResolvedValue(undefined);
  notifications.addNotificationResponseReceivedListener.mockImplementation((listener) => {
    responseListener = listener;
    return { remove: jest.fn() };
  });
  notifications.addNotificationReceivedListener.mockImplementation((listener) => {
    receivedListener = listener;
    return { remove: jest.fn() };
  });
  api.markNotificationRead.mockResolvedValue({} as never);
  jest.mocked(registerDevicePushToken).mockResolvedValue('ExponentPushToken[abc]');
});

describe('usePushNotifications', () => {
  it('registers the push token shortly after mounting', async () => {
    jest.useFakeTimers();
    await renderPush();

    expect(registerDevicePushToken).not.toHaveBeenCalled();
    await act(() => jest.advanceTimersByTime(1500));
    expect(registerDevicePushToken).toHaveBeenCalledTimes(1);
  });

  it('routes a tapped notification, marks it read and refreshes the data', async () => {
    const { onRefresh } = await renderPush();

    await act(() =>
      responseListener?.(
        buildResponse('push-1', { notificationId: 'n1', type: 'CHARGING_COMPLETE', sessionId: 's1' }),
      ),
    );

    expect(router.push).toHaveBeenCalledWith({ pathname: '/sessions/[sessionId]', params: { sessionId: 's1' } });
    expect(api.markNotificationRead).toHaveBeenCalledWith('n1');
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(notifications.clearLastNotificationResponseAsync).toHaveBeenCalled();
  });

  it('handles the notification that cold started the app only once', async () => {
    const response = buildResponse('push-2', { notificationId: 'n2', type: 'QUEUE_TURN', chargePointId: 'cp-1' });
    notifications.getLastNotificationResponse.mockReturnValue(response);

    await renderPush();
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/charge-points/[chargePointId]',
      params: { chargePointId: 'cp-1' },
    });

    await act(() => responseListener?.(response));
    expect(router.push).toHaveBeenCalledTimes(1);
  });

  it('opens the session of a local reminder without marking anything read', async () => {
    await renderPush();

    await act(() => responseListener?.(buildResponse('session-reminder:s9:grace', { type: 'SESSION_REMINDER', sessionId: 's9' })));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/sessions/[sessionId]', params: { sessionId: 's9' } });
    expect(api.markNotificationRead).not.toHaveBeenCalled();
  });

  it('ignores custom actions', async () => {
    await renderPush();

    await act(() => responseListener?.(buildResponse('push-3', { type: 'CHARGING_COMPLETE', sessionId: 's1' }, 'dismiss')));

    expect(router.push).not.toHaveBeenCalled();
  });

  it('refetches the notices and the sessions when a push arrives in the foreground', async () => {
    const { invalidate, onRefresh } = await renderPush();

    await act(() => receivedListener?.({} as Notifications.Notification));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: notificationsQueryKey });
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows a foreground push as an in-app toast that opens its screen when tapped', async () => {
    const { onRefresh } = await renderPush();

    await act(() =>
      receivedListener?.(
        buildNotification('push-4', {
          title: 'Recarga concluída',
          body: 'Seu veículo terminou de carregar.',
          data: { notificationId: 'n4', type: 'CHARGING_COMPLETE', sessionId: 's4' },
        }),
      ),
    );

    expect(screen.getByText('Recarga concluída')).toBeOnTheScreen();
    expect(screen.getByText('Seu veículo terminou de carregar.')).toBeOnTheScreen();
    expect(router.push).not.toHaveBeenCalled();

    await act(() => fireEvent.press(screen.getByTestId('toast')));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/sessions/[sessionId]', params: { sessionId: 's4' } });
    expect(api.markNotificationRead).toHaveBeenCalledWith('n4');
    expect(onRefresh).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('hides the toast on its own after a few seconds', async () => {
    jest.useFakeTimers();
    await renderPush();

    await act(() =>
      receivedListener?.(buildNotification('push-5', { title: 'Pagamento confirmado', body: 'R$ 12,00' })),
    );
    expect(screen.getByTestId('toast')).toBeOnTheScreen();

    await act(() => jest.advanceTimersByTime(NOTIFICATION_TOAST_DURATION_MS));
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('shows a session alert once when the local reminder and the push both arrive', async () => {
    await renderPush();
    const content = {
      title: 'Taxa de ocupação iniciada',
      body: 'Libere a vaga.',
      data: { type: 'IDLE_FEE_STARTED', sessionId: 's6' },
    };

    await act(() => receivedListener?.(buildNotification('session-reminder:s6:idle', content)));
    await act(() => fireEvent.press(screen.getByTestId('toast')));
    await act(() => receivedListener?.(buildNotification('push-6', content)));

    expect(screen.queryByTestId('toast')).toBeNull();
  });
});
