import { router } from 'expo-router';
import { BatteryCharging, Clock, CreditCard, TriangleAlert, Zap, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, Divider } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { MetricTile } from '@/components/ui/metric-tile';
import { ProgressMeter } from '@/components/ui/progress-meter';
import { StatusPill, type Status } from '@/components/ui/status-pill';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { ChargingSession } from '@/features/charging/api/charging-api';
import { formatAmount } from '@/features/charging/charging-format';
import { formatEnergy } from '@/utils/format-energy';

type StatusCopy = { label: string; status: Status; icon: LucideIcon; color: string; hint: string };

export const activeSessionCopy: Partial<Record<ChargingSession['status'], StatusCopy>> = {
  AWAITING_PAYMENT: {
    label: 'Pagamento',
    status: 'info',
    icon: CreditCard,
    color: colors.statusInfo,
    hint: 'Aguardando a pré-autorização',
  },
  PENDING: { label: 'Liberando', status: 'info', icon: Clock, color: colors.statusInfo, hint: 'Aguardando o carregador' },
  ACTIVE: {
    label: 'Carregando',
    status: 'charging',
    icon: BatteryCharging,
    color: colors.statusCharging,
    hint: 'Recarga em andamento',
  },
  GRACE: {
    label: 'Tolerância',
    status: 'idle',
    icon: Clock,
    color: colors.statusIdle,
    hint: 'Carga concluída · retire o veículo',
  },
  IDLE: {
    label: 'Ocupação',
    status: 'fault',
    icon: TriangleAlert,
    color: colors.statusFault,
    hint: 'Taxa de ocupação em curso',
  },
};

export type ActiveSessionCardProps = {
  session: ChargingSession;
};

export function ActiveSessionCard({ session }: ActiveSessionCardProps) {
  const copy = activeSessionCopy[session.status];
  if (!copy) return null;

  const soc = session.socPercent;

  return (
    <Card style={[styles.card, session.idleFeeCents > 0 && styles.cardFault]}>
      <View style={styles.header}>
        <View style={styles.tile}>
          <Icon icon={copy.icon} size={22} color={copy.color} />
        </View>
        <View style={styles.titles}>
          <Text numberOfLines={1} style={styles.name}>
            {session.chargePoint.name}
          </Text>
          <Text numberOfLines={1} style={styles.hint}>
            {copy.hint}
          </Text>
        </View>
        <StatusPill status={copy.status} icon={copy.icon} label={copy.label} />
      </View>
      <Divider style={styles.divider} />
      <View style={styles.metrics}>
        <MetricTile
          value={formatEnergy(session.energyKwh, { withUnit: false })}
          unit="kWh"
          label="Energia"
          tone="charging"
          style={styles.metric}
        />
        <MetricTile
          value={formatAmount(session.totalCents)}
          unit="R$"
          label="Custo até agora"
          tone={session.idleFeeCents > 0 ? 'fault' : 'default'}
          style={styles.metric}
        />
        <MetricTile
          value={soc == null ? '—' : String(Math.round(soc))}
          unit={soc == null ? undefined : '%'}
          label="Bateria"
          style={styles.metric}
        />
      </View>
      {soc != null ? <ProgressMeter value={soc} caption="Estado de carga" valueLabel={`${Math.round(soc)}%`} /> : null}
      <Button
        label="Acompanhar sessão"
        icon={Zap}
        size="lg"
        block
        haptic
        onPress={() => router.push({ pathname: '/sessions/[sessionId]', params: { sessionId: session.id } })}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  cardFault: {
    borderWidth: 1,
    borderColor: colors.borderDanger,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tile: {
    width: 44,
    height: 44,
    borderRadius: radii.tile,
    backgroundColor: colors.surfaceInset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  hint: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 2,
  },
  divider: {
    marginVertical: -spacing.xxs,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metric: {
    flex: 1,
  },
});
