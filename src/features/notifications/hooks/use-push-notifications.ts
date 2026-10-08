import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useEffectEvent } from 'react';

import { useToast } from '@/components/ui/toast';
import { notificationsQueryKey, useMarkNotificationRead } from '@/features/notifications/api/use-notifications';
import { getNotificationToast } from '@/features/notifications/notification-format';
import {
  getNotificationHref,
  getPushNotificationId,
  getSessionAlertKey,
} from '@/features/notifications/notification-routing';
import { isPushSupported, registerDevicePushToken, shouldPresentAlert } from '@/lib/push-notifications';

const REGISTRATION_DELAY_MS = 1200;
export const NOTIFICATION_TOAST_DURATION_MS = 4000;

const handledResponses = new Set<string>();

type NotificationData = Record<string, unknown> | null | undefined;

export function usePushRegistration() {
  useEffect(() => {
    if (!isPushSupported()) return;
    const timer = setTimeout(() => {
      registerDevicePushToken().catch(() => undefined);
    }, REGISTRATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
}

function useOpenNotification(onOpened?: () => void) {
  const markRead = useMarkNotificationRead();

  return (data: NotificationData) => {
    onOpened?.();

    const notificationId = getPushNotificationId(data);
    if (notificationId) markRead.mutate(notificationId);

    const href = getNotificationHref(data?.type, data);
    if (href) router.push(href);
  };
}

export function useNotificationResponses(onOpened?: () => void) {
  const openNotification = useOpenNotification(onOpened);

  const handleResponse = useEffectEvent((response: Notifications.NotificationResponse) => {
    if (!response?.notification?.request) return;
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const identifier = response.notification.request.identifier;
    if (handledResponses.has(identifier)) return;
    handledResponses.add(identifier);

    openNotification(response.notification.request.content.data);

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
  const toast = useToast();
  const openNotification = useOpenNotification(onReceived);

  const handleReceived = useEffectEvent((notification: Notifications.Notification) => {
    queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    onReceived?.();

    const content = notification?.request?.content;
    const title = content?.title || null;
    const body = content?.body || null;
    if (!title && !body) return;
    if (!shouldPresentAlert(content?.data, getSessionAlertKey)) return;

    const { icon, tone } = getNotificationToast(content?.data?.type);
    toast.show(body ?? title ?? '', {
      title: body ? (title ?? undefined) : undefined,
      icon,
      tone,
      duration: NOTIFICATION_TOAST_DURATION_MS,
      onPress: () => openNotification(content?.data),
    });
  });

  useEffect(() => {
    if (!isPushSupported()) return;
    const subscription = Notifications.addNotificationReceivedListener((notification) => handleReceived(notification));
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
