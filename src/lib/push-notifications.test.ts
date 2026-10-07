import * as Notifications from 'expo-notifications';

import { apiClient } from '@/lib/api-client';
import {
  configureNotificationHandler,
  registerDevicePushToken,
  unregisterDevicePushToken,
} from '@/lib/push-notifications';

jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 4 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { easConfig: { projectId: 'project-1' }, expoConfig: null },
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: { POST: jest.fn(), DELETE: jest.fn() },
}));

const notifications = jest.mocked(Notifications);
const api = jest.mocked(apiClient);
const TOKEN = 'ExponentPushToken[abc]';

function permission(granted: boolean, canAskAgain = true) {
  return { granted, canAskAgain } as Notifications.NotificationPermissionsStatus;
}

beforeEach(async () => {
  jest.clearAllMocks();
  notifications.getExpoPushTokenAsync.mockResolvedValue({ type: 'expo', data: TOKEN });
  api.POST.mockResolvedValue({ response: { ok: true, status: 201 } } as never);
  api.DELETE.mockResolvedValue({ response: { ok: true, status: 204 } } as never);
  notifications.getPermissionsAsync.mockResolvedValue(permission(false, false));
  await unregisterDevicePushToken();
  jest.clearAllMocks();
});

describe('registerDevicePushToken', () => {
  it('asks for permission and registers the expo token with the platform', async () => {
    notifications.getPermissionsAsync.mockResolvedValue(permission(false));
    notifications.requestPermissionsAsync.mockResolvedValue(permission(true));

    await expect(registerDevicePushToken()).resolves.toBe(TOKEN);

    expect(notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'project-1' });
    expect(api.POST).toHaveBeenCalledWith('/me/push-tokens', { body: { token: TOKEN, platform: 'IOS' } });
  });

  it('skips the registration when permission is denied', async () => {
    notifications.getPermissionsAsync.mockResolvedValue(permission(false, false));

    await expect(registerDevicePushToken()).resolves.toBeNull();

    expect(notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(api.POST).not.toHaveBeenCalled();
  });
});

describe('unregisterDevicePushToken', () => {
  it('removes the registered token', async () => {
    notifications.getPermissionsAsync.mockResolvedValue(permission(true));
    await registerDevicePushToken();
    notifications.getExpoPushTokenAsync.mockClear();

    await unregisterDevicePushToken();

    expect(api.DELETE).toHaveBeenCalledWith('/me/push-tokens/{token}', { params: { path: { token: TOKEN } } });
    expect(notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('reads the token again when it was not registered in this run', async () => {
    notifications.getPermissionsAsync.mockResolvedValue(permission(true));

    await unregisterDevicePushToken();

    expect(api.DELETE).toHaveBeenCalledWith('/me/push-tokens/{token}', { params: { path: { token: TOKEN } } });
  });

  it('does nothing without permission and never throws', async () => {
    notifications.getPermissionsAsync.mockResolvedValue(permission(false));
    await expect(unregisterDevicePushToken()).resolves.toBeUndefined();
    expect(api.DELETE).not.toHaveBeenCalled();

    notifications.getPermissionsAsync.mockResolvedValue(permission(true));
    api.DELETE.mockRejectedValue(new Error('offline'));
    await expect(unregisterDevicePushToken()).resolves.toBeUndefined();
  });
});

describe('configureNotificationHandler', () => {
  function handlerResult(data: Record<string, unknown>) {
    const handler = notifications.setNotificationHandler.mock.calls.at(-1)![0]!;
    return handler.handleNotification({ request: { content: { data } } } as unknown as Notifications.Notification);
  }

  it('shows each session alert once when the reminder and the push both arrive', async () => {
    configureNotificationHandler((data) => (typeof data?.alert === 'string' ? data.alert : null));

    await expect(handlerResult({ alert: 's1:complete' })).resolves.toMatchObject({
      shouldShowBanner: true,
      shouldPlaySound: true,
    });
    await expect(handlerResult({ alert: 's1:complete' })).resolves.toMatchObject({
      shouldShowBanner: false,
      shouldPlaySound: false,
      shouldShowList: true,
    });
    await expect(handlerResult({ alert: 's1:idle' })).resolves.toMatchObject({ shouldShowBanner: true });
    await expect(handlerResult({ other: true })).resolves.toMatchObject({ shouldShowBanner: true });
    await expect(handlerResult({ other: true })).resolves.toMatchObject({ shouldShowBanner: true });
  });
});
