import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';

import { IconButton } from '@/components/ui/icon-button';
import type { ColorScheme } from '@/constants/theme';
import { useUnreadNotificationsCount } from '@/features/notifications/api/use-notifications';

export function formatBellLabel(unreadCount: number) {
  if (unreadCount === 0) return 'Avisos';
  return unreadCount === 1 ? 'Avisos, 1 aviso não lido' : `Avisos, ${unreadCount} avisos não lidos`;
}

export type NotificationsBellProps = {
  scheme?: ColorScheme;
};

export function NotificationsBell({ scheme = 'light' }: NotificationsBellProps) {
  const unreadCount = useUnreadNotificationsCount();

  return (
    <IconButton
      icon={Bell}
      tone="surface"
      scheme={scheme}
      badge={unreadCount > 0}
      accessibilityLabel={formatBellLabel(unreadCount)}
      testID="notifications-bell"
      onPress={() => router.push('/notifications')}
    />
  );
}
