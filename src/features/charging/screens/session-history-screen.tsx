import { router } from 'expo-router';
import { MapPin, RotateCw } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card, Divider, SectionTitle } from '@/components/ui/card';
import { FadeInItem } from '@/components/ui/fade-in-item';
import { InfoBanner } from '@/components/ui/info-banner';
import { MetricTile } from '@/components/ui/metric-tile';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StatusPill } from '@/components/ui/status-pill';
import { useTabBarHeight } from '@/components/ui/tab-bar';
import { colors, fonts, radii, spacing, typography } from '@/constants/theme';
import type { ChargePointType, ChargingSession } from '@/features/charging/api/charging-api';
import { useSessionHistory } from '@/features/charging/api/use-charging-sessions';
import {
  formatAmount,
  formatCents,
  formatDate,
  formatTime,
  sessionStatusLabels,
  sessionStatusPill,
} from '@/features/charging/charging-format';
import { WeeklyConsumptionChart } from '@/features/charging/components/weekly-consumption-chart';
import {
  getRecentMonths,
  getRegimes,
  getWeeklyConsumption,
  summarizeSessions,
} from '@/features/charging/history-month';
import { formatEnergy } from '@/utils/format-energy';

const HEADER_ITEMS = 4;
const MAX_STAGGER_INDEX = 10;

const regimeBanners: Record<ChargePointType, { title: string; body: string; tone: 'success' | 'info' }> = {
  PRIVATE: {
    title: 'Condomínio · energia a custo',
    body: 'Energia repassada a custo, sem margem, e somada à taxa condominial da sua unidade.',
    tone: 'success',
  },
  COMMERCIAL: {
    title: 'Comercial · preço dinâmico',
    body: 'O preço por kWh acompanha a demanda, fica travado no início da recarga e é cobrado no cartão.',
    tone: 'info',
  },
};

function formatSessionCount(total: number) {
  if (total === 0) return 'Nenhuma recarga';
  return total === 1 ? '1 recarga' : `${total} recargas`;
}

function openSession(sessionId: string) {
  router.push({ pathname: '/sessions/[sessionId]', params: { sessionId } });
}

export function SessionHistoryScreen() {
  const [months] = useState(() => getRecentMonths(Date.now()));
  const [month, setMonth] = useState(months[0].value);
  const { data, isPending, isError, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSessionHistory(month);
  const tabBarHeight = useTabBarHeight();
  const sessions = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const monthLabel = months.find((option) => option.value === month)?.label ?? '';

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppBar variant="large" title="Histórico" subtitle={data ? formatSessionCount(total) : undefined} />
      <FlatList
        key={month}
        data={isPending || isError ? [] : sessions}
        keyExtractor={(session) => session.id}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.accent} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <FadeInItem index={0}>
              <SegmentedControl<string> options={months} value={month} onChange={setMonth} testID="month-control" />
            </FadeInItem>
            {isPending ? (
              <View style={styles.loading}>
                <ActivityIndicator accessibilityLabel="Carregando histórico" color={colors.accent} size="large" />
              </View>
            ) : isError ? (
              <Card style={styles.stack}>
                <Text style={typography.body}>Não foi possível carregar o seu histórico.</Text>
                <Button
                  label="Tentar novamente"
                  icon={RotateCw}
                  variant="secondary"
                  size="sm"
                  loading={isRefetching}
                  onPress={() => refetch()}
                />
              </Card>
            ) : sessions.length === 0 ? (
              <EmptyMonth monthLabel={monthLabel} />
            ) : (
              <MonthOverview sessions={sessions} total={total} month={month} />
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <FadeInItem index={Math.min(index + HEADER_ITEMS, MAX_STAGGER_INDEX)}>
            <SessionRow session={item} onPress={() => openSession(item.id)} />
          </FadeInItem>
        )}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator accessibilityLabel="Carregando mais recargas" color={colors.accent} />
          ) : sessions.length > 0 ? (
            <Text style={styles.legal}>Sessão interrompida registra o kWh parcial medido até a desconexão.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

type MonthOverviewProps = {
  sessions: ChargingSession[];
  total: number;
  month: string;
};

function MonthOverview({ sessions, total, month }: MonthOverviewProps) {
  const summary = summarizeSessions(sessions);
  const weeks = getWeeklyConsumption(sessions, month);
  const regimes = getRegimes(sessions);
  const isPartial = sessions.length < total;

  return (
    <>
      <FadeInItem index={1}>
        <Card>
          <View style={styles.metrics}>
            <MetricTile
              value={formatEnergy(summary.energyKwh, { withUnit: false, fractionDigits: 1 })}
              unit="kWh"
              label="Consumo"
              style={styles.metric}
            />
            <MetricTile value={formatAmount(summary.energyCents)} unit="R$" label="Energia" style={styles.metric} />
            <MetricTile
              value={formatAmount(summary.idleCents)}
              unit="R$"
              label="Ocupação"
              tone={summary.idleCents > 0 ? 'fault' : 'default'}
              style={styles.metric}
            />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{isPartial ? 'Total das recargas carregadas' : 'Total no mês'}</Text>
            <MetricTile value={formatAmount(summary.totalCents)} unit="R$" />
          </View>
        </Card>
      </FadeInItem>
      <FadeInItem index={2}>
        <WeeklyConsumptionChart weeks={weeks} />
      </FadeInItem>
      <FadeInItem index={3} style={styles.stack}>
        {regimes.map((regime) => (
          <InfoBanner key={regime} tone={regimeBanners[regime].tone} title={regimeBanners[regime].title}>
            {regimeBanners[regime].body}
          </InfoBanner>
        ))}
      </FadeInItem>
      <View style={styles.sessionsHead}>
        <SectionTitle style={styles.sessionsTitle}>Sessões</SectionTitle>
        <Text style={styles.sessionsCount}>{formatSessionCount(total)}</Text>
      </View>
    </>
  );
}

function EmptyMonth({ monthLabel }: { monthLabel: string }) {
  return (
    <FadeInItem index={1}>
      <Card style={styles.stack}>
        <Text style={typography.subtitle}>Nenhuma recarga em {monthLabel.toLowerCase()}</Text>
        <Text style={styles.hint}>Suas recargas aparecem aqui com energia, preço e taxas de cada sessão.</Text>
        <Button label="Encontrar pontos de recarga" icon={MapPin} size="sm" onPress={() => router.navigate('/')} />
      </Card>
    </FadeInItem>
  );
}

function SessionRow({ session, onPress }: { session: ChargingSession; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${session.chargePoint.name}, ${formatDate(session.startedAt)}, ${formatCents(session.totalCents)}`}
      onPress={onPress}
      scaleTo={0.98}
      style={styles.row}
    >
      <View style={styles.rowTexts}>
        <Text style={styles.rowTitle}>{session.chargePoint.name}</Text>
        <Text style={styles.rowHint}>
          {formatDate(session.startedAt)} · {formatTime(session.startedAt)} · {formatEnergy(session.energyKwh)}
        </Text>
        <StatusPill status={sessionStatusPill[session.status]} label={sessionStatusLabels[session.status]} />
      </View>
      <View style={styles.rowValue}>
        <Text style={styles.rowTotal}>{formatCents(session.totalCents)}</Text>
        {session.idleFeeCents > 0 ? (
          <Text style={styles.rowIdle}>+ {formatCents(session.idleFeeCents)} ocupação</Text>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
  header: {
    gap: spacing.md,
  },
  loading: {
    paddingVertical: spacing.massive,
    alignItems: 'center',
  },
  stack: {
    gap: spacing.md,
  },
  hint: {
    ...typography.body,
    color: colors.textMuted,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metric: {
    flex: 1,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  sessionsHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingRight: spacing.xxs,
  },
  sessionsTitle: {
    marginTop: 0,
  },
  sessionsCount: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textSubtle,
  },
  legal: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: colors.textDisabled,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: 14,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceCard,
  },
  rowTexts: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  rowHint: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
  },
  rowValue: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rowTotal: {
    fontSize: 16,
    fontFamily: fonts.extrabold,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  rowIdle: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: colors.statusFault,
  },
});
