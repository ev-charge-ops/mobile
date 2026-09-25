import { apiClient } from '@/lib/api-client';
import type { components } from '@/lib/api-schema';

export type AppNotification = components['schemas']['NotificationResponseDto'];
export type AppNotificationType = components['schemas']['NotificationType'];
export type NotificationPage = components['schemas']['NotificationPageResponseDto'];

type ApiResult<T> = { data?: T; response: Response };

async function unwrap<T>(request: Promise<ApiResult<T>>, label: string): Promise<T> {
  const { data, response } = await request;
  if (!response.ok || data === undefined) throw new Error(`${label} failed with status ${response.status}`);
  return data;
}

export function listMyNotifications(page: number, pageSize: number) {
  return unwrap(apiClient.GET('/me/notifications', { params: { query: { page, pageSize } } }), 'Notifications request');
}

export function markNotificationRead(notificationId: string) {
  return unwrap(
    apiClient.POST('/me/notifications/{notificationId}/read', { params: { path: { notificationId } } }),
    'Mark notification read',
  );
}

export function markAllNotificationsRead() {
  return unwrap(apiClient.POST('/me/notifications/read-all'), 'Mark all notifications read');
}
