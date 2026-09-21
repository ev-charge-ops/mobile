import { router } from 'expo-router';
import { BatteryCharging, ChevronRight, Clock, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { MetricTile } from '@/components/ui/metric-tile';
import { PressableScale } from '@/components/ui/pressable-scale';
import { StatusPill } from '@/components/ui/status-pill';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { ChargingSession } from '@/features/charging/api/charging-api';
import { useActiveSession } from '@/features/charging/api/use-charging-sessions';
import { formatAmount, formatPowerValue } from '@/features/charging/charging-format';
import { formatEnergy } from '@/utils/format-energy';

type StatusCopy = { label: string; status: 'charging' | 'idle' | 'fault' | 'info'; icon: LucideIcon; hint: string };

const statusCopy: Partial<Record<ChargingSession['status'], StatusCopy>> = {
  PENDING: { label: 'Liberando', status: 'info', icon: Clock, hint: 'Aguardando o carregador' },
  ACTIVE: { label: 'Carregando', status: 'charging', icon: BatteryCharging, hint: 'Recarga em andamento' },
  GRACE: { label: 'Tolerância', status: 'idle', icon: Clock, hint: 'Carga concluída · retire o veículo' },
  IDLE: { label: 'Ocupação', status: 'fault', icon: TriangleAlert, hint: 'Taxa de ocupação em curso' },
};

export function ActiveSessionCard() {
  const { data: session } = useActiveSession();
  const copy = session ? statusCopy[session.status] : undefined;

  if (!session || !copy) return null;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${copy.hint}, ${session.chargePoint.name}. Acompanhar recarga`}
      onPress={() => router.push({ pathname: '/sessions/[sessionId]', params: { sessionId: session.id } })}
      scaleTo={0.98}
      style={styles.card}
    >
      <View style={styles.header}>
        <StatusPill status={copy.status} icon={copy.icon} label={copy.label} />
        <Text style={styles.hint}>{copy.hint}</Text>
        <Icon icon={ChevronRight} size={18} color={colors.textDisabled} />
      </View>
      <Text style={styles.name}>{session.chargePoint.name}</Text>
      <View style={styles.metrics}>
        <MetricTile
          value={formatEnergy(session.energyKwh, { withUnit: false })}
          unit="kWh"
          label="Energia"
          tone="charging"
          style={styles.metric}
        />
        <MetricTile value={formatPowerValue(session.powerKw)} unit="kW" label="Potência" style={styles.metric} />
        <MetricTile
          value={formatAmount(session.totalCents)}
          unit="R$"
          label="Até agora"
          tone={session.idleFeeCents > 0 ? 'fault' : 'default'}
          style={styles.metric}
        />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.cardPadding,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.statusChargingBg,
    backgroundColor: colors.surfaceCard,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hint: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textSubtle,
  },
  name: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metric: {
    flex: 1,
  },
});
