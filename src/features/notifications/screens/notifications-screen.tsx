import { router } from 'expo-router';
import { BellOff, ChevronLeft, RotateCw } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Rise } from '@/components/ui/rise';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { colors, fonts, palette, spacing } from '@/constants/theme';
import type { AppNotification } from '@/features/notifications/api/notifications-api';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/api/use-notifications';
import { NotificationCard } from '@/features/notifications/components/notification-card';
import {
  filterNotifications,
  groupNotifications,
  notificationFilters,
  type NotificationFilter,
  type NotificationSection,
} from '@/features/notifications/notification-format';
import { getNotificationHref } from '@/features/notifications/notification-routing';
import { useNow } from '@/hooks/use-now';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';

const SECTIONS_START_INDEX = 2;

export function NotificationsScreen() {
  const now = useNow(30_000);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const { data, isPending, isError, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.pages.flatMap((page) => page.items) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;
  const sections = groupNotifications(filterNotifications(notifications, filter), now);
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const openNotification = (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    const href = getNotificationHref(notification.type, notification.data);
    if (href) router.push(href);
  };

  const readState =
    unreadCount > 0 ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Marcar todas como lidas"
        disabled={markAllRead.isPending}
        hitSlop={8}
        onPress={() => markAllRead.mutate()}
      >
        {({ pressed }) => <Text style={[styles.markAll, pressed && styles.pressed]}>Marcar todas como lidas</Text>}
      </Pressable>
    ) : (
      <Text style={styles.allRead}>Tudo lido</Text>
    );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <Rise index={0} style={styles.header}>
        <IconButton icon={ChevronLeft} tone="surface" accessibilityLabel="Voltar" onPress={() => router.back()} />
        <Text accessibilityRole="header" style={styles.title}>
          Notificações
        </Text>
      </Rise>
      <Rise index={1} style={styles.filters}>
        <SegmentedControl
          options={notificationFilters}
          value={filter}
          onChange={setFilter}
          style={styles.segmented}
          testID="notification-filters"
        />
      </Rise>
      {isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator accessibilityLabel="Carregando avisos" color={colors.accent} size="large" />
        </View>
      ) : isError && !data ? (
        <View style={styles.content}>
          <View style={[styles.group, styles.message]}>
            <Text style={styles.messageText}>Não foi possível carregar seus avisos.</Text>
            <Button
              label="Tentar novamente"
              icon={RotateCw}
              variant="secondary"
              size="sm"
              loading={isRefetching}
              onPress={() => refetch()}
            />
          </View>
        </View>
      ) : (
        <FlatList
          testID="notifications-list"
          data={sections}
          keyExtractor={(section) => section.key}
          contentContainerStyle={[styles.content, sections.length === 0 && styles.emptyContent]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          ListEmptyComponent={
            notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              <Text style={styles.filterEmpty}>Nenhum aviso nesta categoria.</Text>
            )
          }
          renderItem={({ item, index }) => (
            <NotificationGroup
              section={item}
              index={SECTIONS_START_INDEX + index * 2}
              trailing={index === 0 ? readState : null}
              now={now}
              onOpen={openNotification}
            />
          )}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator accessibilityLabel="Carregando mais avisos" color={colors.accent} />
            ) : notifications.length > 0 ? (
              <Text style={styles.legal}>Nenhuma cobrança acontece sem um aviso anterior.</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

type NotificationGroupProps = {
  section: NotificationSection;
  index: number;
  trailing: ReactNode;
  now: number;
  onOpen: (notification: AppNotification) => void;
};

function NotificationGroup({ section, index, trailing, now, onOpen }: NotificationGroupProps) {
  return (
    <View style={styles.section}>
      <Rise index={index} style={styles.sectionHead}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {section.title}
        </Text>
        {trailing}
      </Rise>
      <Rise index={index + 1} style={styles.group}>
        {section.items.map((notification, position) => (
          <View key={notification.id}>
            {position > 0 ? <View style={styles.divider} /> : null}
            <NotificationCard notification={notification} now={now} onPress={() => onOpen(notification)} />
          </View>
        ))}
      </Rise>
    </View>
  );
}

function EmptyNotifications() {
  return (
    <View style={styles.emptyWrap}>
      <Rise index={2} style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Icon icon={BellOff} size={30} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>Nenhum aviso por enquanto</Text>
        <Text style={styles.emptyHint}>
          Início e fim de recarga, tolerância e cobranças aparecem aqui assim que acontecerem.
        </Text>
      </Rise>
      <Text style={styles.legal}>Nenhuma cobrança acontece sem um aviso anterior.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fonts.bold,
    letterSpacing: -0.8,
    color: colors.textTitle,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  segmented: {
    height: 48,
    backgroundColor: palette.ink300,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyContent: {
    flexGrow: 1,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHead: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  markAll: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textTitle,
    paddingVertical: 6,
  },
  allRead: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.6,
  },
  group: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 24,
    borderCurve: 'continuous',
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.hairline,
  },
  message: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: colors.textBody,
  },
  filterEmpty: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyWrap: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  emptyHint: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  legal: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
    textAlign: 'center',
    padding: spacing.xs,
  },
});
