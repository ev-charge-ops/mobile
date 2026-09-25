import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationPage,
} from '@/features/notifications/api/notifications-api';

export const notificationsQueryKey = ['me', 'notifications'] as const;

const NOTIFICATIONS_PAGE_SIZE = 20;
const NOTIFICATIONS_REFRESH_INTERVAL = 60_000;

type NotificationPages = InfiniteData<NotificationPage, number>;

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationsQueryKey,
    queryFn: ({ pageParam }) => listMyNotifications(pageParam, NOTIFICATIONS_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total ? lastPage.page + 1 : undefined,
    refetchInterval: NOTIFICATIONS_REFRESH_INTERVAL,
  });
}

export function useUnreadNotificationsCount() {
  const { data } = useNotifications();
  return data?.pages[0]?.unreadCount ?? 0;
}

export function markReadInPages(pages: NotificationPages | undefined, notificationId: string, readAt: string) {
  if (!pages) return pages;
  const target = pages.pages.flatMap((page) => page.items).find((item) => item.id === notificationId);
  if (!target || target.readAt) return pages;

  return {
    ...pages,
    pages: pages.pages.map((page) => ({
      ...page,
      unreadCount: Math.max(0, page.unreadCount - 1),
      items: page.items.map((item) => (item.id === notificationId ? { ...item, readAt } : item)),
    })),
  };
}

export function markAllReadInPages(pages: NotificationPages | undefined, readAt: string) {
  if (!pages) return pages;

  return {
    ...pages,
    pages: pages.pages.map((page) => ({
      ...page,
      unreadCount: 0,
      items: page.items.map((item) => (item.readAt ? item : { ...item, readAt })),
    })),
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      queryClient.setQueryData<NotificationPages>(notificationsQueryKey, (pages) =>
        markReadInPages(pages, notificationId, new Date().toISOString()),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      queryClient.setQueryData<NotificationPages>(notificationsQueryKey, (pages) =>
        markAllReadInPages(pages, new Date().toISOString()),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  });
}
