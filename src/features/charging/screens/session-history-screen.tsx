import { router } from 'expo-router';
import { MapPin, RotateCw } from 'lucide-react-native';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MetricTile } from '@/components/ui/metric-tile';
import { PressableScale } from '@/components/ui/pressable-scale';
import { StatusPill } from '@/components/ui/status-pill';
import { colors, fonts, radii, spacing, typography } from '@/constants/theme';
import type { ChargingSession } from '@/features/charging/api/charging-api';
import { useSessionHistory } from '@/features/charging/api/use-charging-sessions';
import {
  formatAmount,
  formatCents,
  formatDate,
  formatTime,
  sessionStatusLabels,
  sessionStatusPill,
} from '@/features/charging/charging-format';
import { formatEnergy } from '@/utils/format-energy';

function formatSessionCount(total: number) {
  if (total === 0) return undefined;
  return total === 1 ? '1 recarga' : `${total} recargas`;
}

function openSession(sessionId: string) {
  router.push({ pathname: '/sessions/[sessionId]', params: { sessionId } });
}

export function SessionHistoryScreen() {
  const { data, isPending, isError, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSessionHistory();
  const sessions = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppBar title="Histórico" subtitle={formatSessionCount(total)} onBack={() => router.back()} />
      {isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator accessibilityLabel="Carregando histórico" color={colors.accent} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.content}>
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
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(session) => session.id}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.accent} />
          }
          ListHeaderComponent={sessions.length > 0 ? <HistorySummary sessions={sessions} /> : null}
          ListEmptyComponent={
            <Card style={styles.stack}>
              <Text style={typography.subtitle}>Nenhuma recarga ainda</Text>
              <Text style={styles.hint}>Suas recargas aparecem aqui com energia, preço e taxas de cada sessão.</Text>
              <Button
                label="Encontrar pontos de recarga"
                icon={MapPin}
                size="sm"
                onPress={() => router.push('/charge-points')}
              />
            </Card>
          }
          renderItem={({ item }) => <SessionRow session={item} onPress={() => openSession(item.id)} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator accessibilityLabel="Carregando mais recargas" color={colors.accent} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

function HistorySummary({ sessions }: { sessions: ChargingSession[] }) {
  const energyKwh = sessions.reduce((sum, session) => sum + session.energyKwh, 0);
  const energyCents = sessions.reduce((sum, session) => sum + session.energyCostCents, 0);
  const idleCents = sessions.reduce((sum, session) => sum + session.idleFeeCents, 0);

  return (
    <Card style={styles.summary}>
      <View style={styles.metrics}>
        <MetricTile
          value={formatEnergy(energyKwh, { withUnit: false, fractionDigits: 1 })}
          unit="kWh"
          label="Consumo"
          style={styles.metric}
        />
        <MetricTile value={formatAmount(energyCents)} unit="R$" label="Energia" style={styles.metric} />
        <MetricTile
          value={formatAmount(idleCents)}
          unit="R$"
          label="Ocupação"
          tone={idleCents > 0 ? 'fault' : 'default'}
          style={styles.metric}
        />
      </View>
      <Text style={styles.caption}>Somatório das recargas carregadas abaixo</Text>
    </Card>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.massive,
  },
  stack: {
    gap: spacing.md,
  },
  hint: {
    ...typography.body,
    color: colors.textMuted,
  },
  summary: {
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metric: {
    flex: 1,
  },
  caption: {
    ...typography.caption,
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
