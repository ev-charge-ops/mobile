import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';
import type { AppNotification } from '@/features/notifications/api/notifications-api';
import { formatNotificationTime, notificationTones } from '@/features/notifications/notification-format';

export type NotificationCardProps = {
  notification: AppNotification;
  now: number;
  onPress: () => void;
};

export function NotificationCard({ notification, now, onPress }: NotificationCardProps) {
  const tone = notificationTones[notification.type];
  const isUnread = notification.readAt == null;
  const time = formatNotificationTime(notification.createdAt, now);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${isUnread ? 'Não lido, ' : ''}${notification.title}, ${time}`}
      accessibilityHint={notification.body}
      onPress={onPress}
      scaleTo={0.98}
      haptic="selection"
      testID={`notification-${notification.id}`}
      style={styles.row}
    >
      <View style={[styles.iconTile, { backgroundColor: tone.backgroundColor }]}>
        <Icon icon={tone.icon} size={20} color={tone.color} />
      </View>
      <View style={styles.texts}>
        <Text style={[styles.title, !isUnread && styles.titleRead]}>{notification.title}</Text>
        <Text style={styles.body}>{notification.body}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={[styles.time, isUnread && styles.timeUnread]}>{time}</Text>
        {isUnread ? <View testID={`notification-unread-${notification.id}`} style={styles.unreadDot} /> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  titleRead: {
    fontFamily: fonts.semibold,
    color: colors.textBody,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  time: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  timeUnread: {
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.info,
  },
});
