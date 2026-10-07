import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { AppNotification } from '@/features/notifications/api/notifications-api';
import { formatRelativeTime, notificationTones } from '@/features/notifications/notification-format';

export type NotificationCardProps = {
  notification: AppNotification;
  now: number;
  onPress: () => void;
};

export function NotificationCard({ notification, now, onPress }: NotificationCardProps) {
  const tone = notificationTones[notification.type];
  const isUnread = notification.readAt == null;
  const time = formatRelativeTime(notification.createdAt, now);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${isUnread ? 'Não lido, ' : ''}${notification.title}, ${time}`}
      accessibilityHint={notification.body}
      onPress={onPress}
      scaleTo={0.98}
      haptic="selection"
      testID={`notification-${notification.id}`}
      style={[styles.card, isUnread && styles.cardUnread]}
    >
      <View style={[styles.iconTile, { backgroundColor: tone.backgroundColor }]}>
        <Icon icon={tone.icon} size={18} color={tone.color} />
      </View>
      <View style={styles.texts}>
        <View style={styles.head}>
          <Text style={[styles.title, !isUnread && styles.titleRead]} numberOfLines={2}>
            {notification.title}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.time}>{time}</Text>
            {isUnread ? <View testID={`notification-unread-${notification.id}`} style={styles.unreadDot} /> : null}
          </View>
        </View>
        <Text style={styles.body}>{notification.body}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: 14,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardUnread: {
    borderColor: colors.borderSubtle,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radii.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    minWidth: 0,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  titleRead: {
    fontFamily: fonts.semibold,
    color: colors.textBody,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: colors.textDisabled,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 2,
  },
});
