import { router } from 'expo-router';
import { RotateCw } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { useTabBarHeight } from '@/components/ui/tab-bar';
import { colors, spacing, typography } from '@/constants/theme';
import type { ChargePoint } from '@/features/charging/api/charging-api';
import { useChargePoints } from '@/features/charging/api/use-charge-points';
import { ChargePointCard } from '@/features/charging/components/charge-point-card';

type Filter = 'ALL' | 'PRIVATE' | 'COMMERCIAL' | 'AVAILABLE';

const filters: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'PRIVATE', label: 'Condomínio' },
  { id: 'COMMERCIAL', label: 'Comercial' },
  { id: 'AVAILABLE', label: 'Só livres' },
];

function matchesFilter(chargePoint: ChargePoint, filter: Filter) {
  if (filter === 'ALL') return true;
  if (filter === 'AVAILABLE') return chargePoint.status === 'AVAILABLE';
  return chargePoint.type === filter;
}

export type ChargePointsScreenProps = {
  subtitle?: string;
  accountAction?: ReactNode;
};

export function ChargePointsScreen({ subtitle, accountAction }: ChargePointsScreenProps) {
  const tabBarHeight = useTabBarHeight();
  const { data: chargePoints, isPending, isError, refetch, isRefetching } = useChargePoints();
  const [filter, setFilter] = useState<Filter>('ALL');
  const visible = chargePoints?.filter((chargePoint) => matchesFilter(chargePoint, filter)) ?? [];

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppBar variant="large" title="Buscar pontos" subtitle={subtitle} actions={accountAction} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xxl }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.accent} />
        }
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => (
            <Chip key={item.id} label={item.label} selected={filter === item.id} onPress={() => setFilter(item.id)} />
          ))}
        </ScrollView>
        {isPending ? (
          <ActivityIndicator accessibilityLabel="Carregando pontos de recarga" color={colors.accent} />
        ) : isError ? (
          <Card style={styles.stack}>
            <Text style={typography.body}>Não foi possível carregar os pontos de recarga.</Text>
            <Button
              label="Tentar novamente"
              icon={RotateCw}
              variant="secondary"
              size="sm"
              loading={isRefetching}
              onPress={() => refetch()}
            />
          </Card>
        ) : visible.length === 0 ? (
          <Card style={styles.stack}>
            <Text style={typography.subtitle}>Nenhum ponto encontrado</Text>
            <Text style={styles.hint}>
              {filter === 'ALL'
                ? 'Ainda não há pontos disponíveis para você. Entre em um condomínio pelo convite do gestor.'
                : 'Nenhum ponto corresponde a este filtro agora.'}
            </Text>
          </Card>
        ) : (
          visible.map((chargePoint) => (
            <ChargePointCard
              key={chargePoint.id}
              chargePoint={chargePoint}
              onPress={() =>
                router.push({ pathname: '/charge-points/[chargePointId]', params: { chargePointId: chargePoint.id } })
              }
            />
          ))
        )}
        <Text style={styles.legal}>
          Preço por kWh se a recarga começar agora. Em condomínio a energia é repassada a custo e o fator de demanda é
          apenas informativo.
        </Text>
      </ScrollView>
    </SafeAreaView>
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
  filters: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  stack: {
    gap: spacing.md,
  },
  hint: {
    ...typography.body,
    color: colors.textMuted,
  },
  legal: {
    ...typography.caption,
    color: colors.textDisabled,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
});
