import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { colors } from '@/constants/theme';
import { apiClient } from '@/lib/api-client';

const DEFAULT_CHANNEL_ID = 'default';

let registeredToken: string | null = null;

export function isPushSupported() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function configureNotificationHandler() {
  if (!isPushSupported()) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: 'Geral',
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: colors.accent,
  });
}

export async function requestPushPermission() {
  if (!isPushSupported()) return false;

  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function hasPushPermission() {
  if (!isPushSupported()) return false;
  const current = await Notifications.getPermissionsAsync();
  return current.granted;
}

export function getProjectId() {
  return Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId ?? null;
}

async function readExpoPushToken() {
  const projectId = getProjectId();
  if (!projectId) return null;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

export async function getExpoPushToken() {
  const granted = await requestPushPermission();
  if (!granted) return null;
  return readExpoPushToken();
}

export async function registerDevicePushToken() {
  const token = await getExpoPushToken();
  if (!token) return null;

  const { response } = await apiClient.POST('/me/push-tokens', {
    body: { token, platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID' },
  });
  if (!response.ok) throw new Error(`Push token registration failed with status ${response.status}`);

  registeredToken = token;
  return token;
}

export async function unregisterDevicePushToken() {
  try {
    const token = registeredToken ?? ((await hasPushPermission()) ? await readExpoPushToken() : null);
    registeredToken = null;
    if (!token) return;

    await apiClient.DELETE('/me/push-tokens/{token}', { params: { path: { token } } });
  } catch {
    return;
  }
}
