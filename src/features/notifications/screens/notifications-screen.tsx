import { router } from 'expo-router';
import { BellOff, CheckCheck, RotateCw } from 'lucide-react-native';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadeInItem } from '@/components/ui/fade-in-item';
import { Icon } from '@/components/ui/icon';
import { colors, fonts, motion, spacing, typography } from '@/constants/theme';
import type { AppNotification } from '@/features/notifications/api/notifications-api';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/api/use-notifications';
import { NotificationCard } from '@/features/notifications/components/notification-card';
import { getNotificationHref } from '@/features/notifications/notification-routing';
import { useNow } from '@/hooks/use-now';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';

const MAX_STAGGER_INDEX = 8;

function formatUnread(unreadCount: number) {
  if (unreadCount === 0) return 'Cada evento financeiro é avisado';
  return unreadCount === 1 ? '1 aviso não lido' : `${unreadCount} avisos não lidos`;
}

export function NotificationsScreen() {
  const now = useNow(30_000);
  const { data, isPending, isError, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.pages.flatMap((page) => page.items) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;
  const contentStyle = [styles.content, { paddingBottom: spacing.xxl }];
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const openNotification = (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    const href = getNotificationHref(notification.type, notification.data);
    if (href) router.push(href);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <AppBar variant="large" title="Avisos" subtitle={formatUnread(unreadCount)} onBack={() => router.back()} />
      {isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator accessibilityLabel="Carregando avisos" color={colors.accent} size="large" />
        </View>
      ) : isError && !data ? (
        <View style={contentStyle}>
          <Card style={styles.stack}>
            <Text style={typography.body}>Não foi possível carregar seus avisos.</Text>
            <Button
              label="Tentar novamente"
              icon={RotateCw}
              variant="secondary"
              size="sm"
              loading={isRefetching}
              onPress={() => refetch()}
            />
          </Card>
        </View>
      ) : (
        <FlatList
          testID="notifications-list"
          data={notifications}
          keyExtractor={(notification) => notification.id}
          contentContainerStyle={[contentStyle, notifications.length === 0 && styles.emptyContent]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ListHeaderComponent={
            unreadCount > 0 ? (
              <Button
                label="Marcar todas como lidas"
                icon={CheckCheck}
                variant="ghost"
                size="sm"
                haptic="success"
                loading={markAllRead.isPending}
                onPress={() => markAllRead.mutate()}
                style={styles.markAll}
              />
            ) : null
          }
          ListEmptyComponent={<EmptyNotifications />}
          renderItem={({ item, index }) => (
            <FadeInItem index={Math.min(index, MAX_STAGGER_INDEX)}>
              <NotificationCard notification={item} now={now} onPress={() => openNotification(item)} />
            </FadeInItem>
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

function EmptyNotifications() {
  return (
    <View style={styles.emptyWrap}>
      <Animated.View
        entering={FadeInDown.duration(motion.duration.slow).easing(motion.easing.sheet)}
        style={styles.empty}
      >
        <View style={styles.emptyIcon}>
          <Icon icon={BellOff} size={30} color={colors.textSubtle} />
        </View>
        <Text style={styles.emptyTitle}>Nenhum aviso por enquanto</Text>
        <Text style={styles.emptyHint}>
          Início e fim de recarga, tolerância e cobranças aparecem aqui assim que acontecerem.
        </Text>
      </Animated.View>
      <Text style={styles.legal}>Nenhuma cobrança acontece sem um aviso anterior.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
  emptyContent: {
    flexGrow: 1,
  },
  stack: {
    gap: spacing.md,
  },
  markAll: {
    alignSelf: 'flex-end',
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
    borderWidth: 1.5,
    borderColor: colors.borderDashed,
    borderStyle: 'dashed',
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
    color: colors.textSubtle,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  legal: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: colors.textDisabled,
    textAlign: 'center',
    padding: spacing.xs,
  },
});
