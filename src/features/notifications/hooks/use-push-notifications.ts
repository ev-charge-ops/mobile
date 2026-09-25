import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useEffectEvent } from 'react';

import { notificationsQueryKey, useMarkNotificationRead } from '@/features/notifications/api/use-notifications';
import { getNotificationHref, getPushNotificationId } from '@/features/notifications/notification-routing';
import { isPushSupported, registerDevicePushToken } from '@/lib/push-notifications';

const REGISTRATION_DELAY_MS = 1200;

const handledResponses = new Set<string>();

export function usePushRegistration() {
  useEffect(() => {
    if (!isPushSupported()) return;
    const timer = setTimeout(() => {
      registerDevicePushToken().catch(() => undefined);
    }, REGISTRATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
}

export function useNotificationResponses(onOpened?: () => void) {
  const markRead = useMarkNotificationRead();

  const handleResponse = useEffectEvent((response: Notifications.NotificationResponse) => {
    if (!response?.notification?.request) return;
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const identifier = response.notification.request.identifier;
    if (handledResponses.has(identifier)) return;
    handledResponses.add(identifier);
    onOpened?.();

    const data = response.notification.request.content.data;
    const notificationId = getPushNotificationId(data);
    if (notificationId) markRead.mutate(notificationId);

    const href = getNotificationHref(data?.type, data);
    if (href) router.push(href);

    Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
  });

  useEffect(() => {
    if (!isPushSupported()) return;

    const initial = Notifications.getLastNotificationResponse();
    if (initial) handleResponse(initial);

    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => subscription.remove();
  }, []);
}

export function useNotificationReceived(onReceived?: () => void) {
  const queryClient = useQueryClient();

  const handleReceived = useEffectEvent(() => {
    queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    onReceived?.();
  });

  useEffect(() => {
    if (!isPushSupported()) return;
    const subscription = Notifications.addNotificationReceivedListener(() => handleReceived());
    return () => subscription.remove();
  }, []);
}

export type PushNotificationsOptions = {
  onRefresh?: () => void;
};

export function usePushNotifications({ onRefresh }: PushNotificationsOptions = {}) {
  usePushRegistration();
  useNotificationResponses(onRefresh);
  useNotificationReceived(onRefresh);
}
