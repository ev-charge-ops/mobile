import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, MapPin, RotateCw } from 'lucide-react-native';
import { Fragment, useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Rise } from '@/components/ui/rise';
import { useTabBarHeight } from '@/components/ui/tab-bar';
import { colors, fonts, spacing } from '@/constants/theme';
import type { ChargingSession } from '@/features/charging/api/charging-api';
import { useSessionHistory } from '@/features/charging/api/use-charging-sessions';
import { useMyStatement } from '@/features/charging/api/use-my-statement';
import { formatCents, formatDate, sessionStatusLabels } from '@/features/charging/charging-format';
import { MonthlyStatementCard } from '@/features/charging/components/monthly-statement-card';
import {
  formatMonthLabel,
  formatShortMonthLabel,
  getCurrentMonth,
  getMonthDistance,
  getSessionDayTile,
  getSessionDuration,
  HISTORY_MONTHS_BACK,
  shiftMonth,
} from '@/features/charging/history-month';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { formatEnergy } from '@/utils/format-energy';

function formatSessionCount(total: number) {
  return total === 1 ? '1 sessão' : `${total} sessões`;
}

function openSession(sessionId: string) {
  router.push({ pathname: '/sessions/[sessionId]', params: { sessionId } });
}

export function SessionHistoryScreen() {
  const [now] = useState(() => Date.now());
  const currentMonth = getCurrentMonth(now);
  const [month, setMonth] = useState(currentMonth);
  const history = useSessionHistory(month);
  const statement = useMyStatement(month);
  const tabBarHeight = useTabBarHeight();
  const sessions = history.data?.pages.flatMap((page) => page.items) ?? [];
  const total = history.data?.pages[0]?.total ?? 0;
  const showError = history.isError && !history.data;
  const monthsBack = getMonthDistance(month, currentMonth);

  const refetchHistory = history.refetch;
  const refetchStatement = statement.refetch;
  const refetchAll = useCallback(
    () => Promise.all([refetchHistory(), refetchStatement()]),
    [refetchHistory, refetchStatement],
  );
  const { refreshing, onRefresh } = usePullToRefresh(refetchAll);

  const loadMore = () => {
    if (history.hasNextPage && !history.isFetchingNextPage) history.fetchNextPage();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          Histórico
        </Text>
        <View style={styles.stepper} testID="month-stepper">
          <IconButton
            icon={ChevronLeft}
            size={36}
            accessibilityLabel="Mês anterior"
            onPress={monthsBack < HISTORY_MONTHS_BACK ? () => setMonth(shiftMonth(month, -1)) : undefined}
            style={monthsBack >= HISTORY_MONTHS_BACK && styles.disabled}
          />
          <Text accessibilityLabel={formatMonthLabel(month)} style={styles.monthLabel}>
            {formatShortMonthLabel(month)}
          </Text>
          <IconButton
            icon={ChevronRight}
            size={36}
            accessibilityLabel="Próximo mês"
            onPress={monthsBack > 0 ? () => setMonth(shiftMonth(month, 1)) : undefined}
            style={monthsBack <= 0 && styles.disabled}
          />
        </View>
      </View>
      <ScrollView
        key={month}
        testID="history-scroll"
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 200) loadMore();
        }}
        scrollEventThrottle={200}
      >
        {statement.data ? (
          <Rise index={0}>
            <MonthlyStatementCard statement={statement.data} />
          </Rise>
        ) : null}
        {history.isPending ? (
          <View style={styles.loading}>
            <ActivityIndicator accessibilityLabel="Carregando histórico" color={colors.accent} size="large" />
          </View>
        ) : showError ? (
          <Rise index={1} style={[styles.card, styles.message]}>
            <Text style={styles.messageText}>Não foi possível carregar o seu histórico.</Text>
            <Button
              label="Tentar novamente"
              icon={RotateCw}
              variant="secondary"
              size="sm"
              loading={history.isRefetching}
              onPress={() => history.refetch()}
            />
          </Rise>
        ) : sessions.length === 0 ? (
          <Rise index={1} style={[styles.card, styles.message]}>
            <Text style={styles.messageTitle}>Nenhuma recarga em {formatMonthLabel(month).toLowerCase()}</Text>
            <Text style={styles.messageText}>
              Suas recargas aparecem aqui com energia, preço e taxas de cada sessão.
            </Text>
            <Button label="Encontrar pontos de recarga" icon={MapPin} size="sm" onPress={() => router.navigate('/points')} />
          </Rise>
        ) : (
          <>
            <Rise index={1} style={styles.listHead}>
              <Text style={styles.listTitle}>Recargas</Text>
              <Text style={styles.listCount}>{formatSessionCount(total)}</Text>
            </Rise>
            <Rise index={2} style={[styles.card, styles.list]}>
              {sessions.map((session, index) => (
                <Fragment key={session.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <SessionRow session={session} now={now} />
                </Fragment>
              ))}
            </Rise>
            {history.isFetchingNextPage ? (
              <ActivityIndicator accessibilityLabel="Carregando mais recargas" color={colors.accent} />
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionRow({ session, now }: { session: ChargingSession; now: number }) {
  const tile = getSessionDayTile(session.startedAt);
  const status = session.status === 'CLOSED' ? null : sessionStatusLabels[session.status];
  const hint = [session.chargePoint.code, getSessionDuration(session, now), status].filter(Boolean).join(' · ');

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${session.chargePoint.name}, ${formatDate(session.startedAt)}, ${formatEnergy(session.energyKwh)}, ${formatCents(session.totalCents)}`}
      onPress={() => openSession(session.id)}
      scaleTo={0.98}
      style={styles.row}
    >
      <View style={styles.dateTile}>
        <Text style={styles.dateDay}>{tile.day}</Text>
        <Text style={styles.dateMonth}>{tile.month}</Text>
      </View>
      <View style={styles.rowTexts}>
        <Text style={styles.rowTitle}>{formatEnergy(session.energyKwh)}</Text>
        <Text numberOfLines={1} style={styles.rowHint}>
          {hint}
        </Text>
      </View>
      <Text style={styles.rowTotal}>{formatCents(session.totalCents)}</Text>
    </PressableScale>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: fonts.bold,
    letterSpacing: -0.9,
    color: colors.textTitle,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceCard,
  },
  monthLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textTitle,
    paddingHorizontal: 2,
  },
  disabled: {
    opacity: 0.3,
  },
  content: {
    flexGrow: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  loading: {
    paddingVertical: spacing.massive,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 24,
    borderCurve: 'continuous',
  },
  message: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  messageTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  listTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  listCount: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  list: {
    paddingVertical: spacing.xs,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.hairline,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  dateTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceInset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 16,
    lineHeight: 18,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  dateMonth: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  rowTexts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
    color: colors.textTitle,
  },
  rowHint: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  rowTotal: {
    fontSize: 15,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
    color: colors.textTitle,
  },
});
