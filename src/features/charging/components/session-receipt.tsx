import { CircleAlert, CircleCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card, SectionTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { InfoBanner } from '@/components/ui/info-banner';
import { ListRow } from '@/components/ui/list-row';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { ChargingSession } from '@/features/charging/api/charging-api';
import {
  formatCents,
  formatDate,
  formatDemandFactor,
  formatDemandSource,
  formatLimit,
  formatPowerValue,
  formatPricePerKwh,
  formatSessionCode,
  formatTime,
  regimeLabels,
} from '@/features/charging/charging-format';
import { formatDuration, getChargingSeconds } from '@/features/charging/session-timing';
import { formatEnergy } from '@/utils/format-energy';

export type SessionReceiptProps = {
  session: ChargingSession;
};

export function SessionReceipt({ session }: SessionReceiptProps) {
  const isInterrupted = session.status === 'INTERRUPTED';
  const isPrivate = session.regime === 'PRIVATE';
  const endedAt = session.endedAt ?? session.chargingEndedAt;
  const chargingSeconds = getChargingSeconds(session, Date.parse(endedAt ?? session.startedAt));
  const averagePowerKw = chargingSeconds > 0 ? session.energyKwh / (chargingSeconds / 3600) : 0;

  return (
    <>
      <View style={styles.header}>
        <View style={[styles.badge, isInterrupted && styles.badgeWarning]}>
          <Icon
            icon={isInterrupted ? CircleAlert : CircleCheck}
            size={30}
            color={isInterrupted ? colors.statusIdle : colors.statusCharging}
          />
        </View>
        <Text style={styles.totalLabel}>
          {isInterrupted ? 'Recarga interrompida' : isPrivate ? 'Vai para o rateio da unidade' : 'Total da recarga'}
        </Text>
        <Text accessibilityLabel={`Total ${formatCents(session.totalCents)}`} style={styles.total}>
          {formatCents(session.totalCents)}
        </Text>
        <Text style={styles.code}>{formatSessionCode(session.id)}</Text>
      </View>

      <Card padding={0}>
        <ListRow
          label="Energia medida"
          value={`${formatEnergy(session.energyKwh)} · ${formatCents(session.energyCostCents)}`}
          hint={`${formatPricePerKwh(session.lockedRateCents)} · tarifa travada no início`}
        />
        <ListRow
          label="Fator de demanda"
          value={formatDemandFactor(session.demandFactor)}
          hint={`${formatDemandSource(session.demandFactorSource, session.demandModelVersion)} · ${
            isPrivate ? 'informativo no condomínio' : 'aplicado sobre a tarifa base'
          }`}
        />
        <ListRow
          label="Taxa de ocupação"
          value={session.idleFeeCents > 0 ? formatCents(session.idleFeeCents) : '—'}
          hint={
            session.idleFeeCents > 0
              ? `${session.idleMinutes} min × ${formatCents(session.idleFeeCentsPerMinute)}${
                  session.idleFeeCents >= session.idleFeeCapCents ? ' · teto atingido' : ''
                }`
              : 'Veículo retirado dentro da tolerância'
          }
        />
        <ListRow label="Total" value={formatCents(session.totalCents)} divider={false} />
      </Card>

      {isInterrupted ? (
        <InfoBanner tone="warning" title="Sessão interrompida">
          A recarga foi interrompida antes do fim. A cobrança considera apenas a energia medida até a desconexão.
        </InfoBanner>
      ) : (
        <InfoBanner tone={isPrivate ? 'success' : 'info'} title={isPrivate ? 'Condomínio' : 'Rede comercial'}>
          {isPrivate
            ? 'Energia a custo, sem margem. O consumo e a taxa de ocupação entram no rateio da sua unidade.'
            : 'Tarifa dinâmica aplicada e travada no início da sessão.'}
        </InfoBanner>
      )}

      <View style={styles.section}>
        <SectionTitle>Detalhes</SectionTitle>
        <Card padding={0}>
          <ListRow label="Ponto" value={session.chargePoint.name} hint={session.chargePoint.code} />
          <ListRow label="Data" value={formatDate(session.startedAt)} />
          <ListRow
            label="Início · fim"
            value={
              endedAt ? `${formatTime(session.startedAt)} · ${formatTime(endedAt)}` : formatTime(session.startedAt)
            }
          />
          <ListRow
            label="Tempo de recarga"
            value={formatDuration(chargingSeconds)}
            hint={averagePowerKw > 0 ? `Potência média de ${formatPowerValue(averagePowerKw)} kW` : undefined}
          />
          <ListRow label="Limite" value={formatLimit(session.limit)} />
          <ListRow
            label="Regime"
            value={regimeLabels[session.regime]}
            hint={session.unitLabel ? `Unidade ${session.unitLabel}` : undefined}
            divider={false}
          />
        </Card>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.statusChargingBg,
  },
  badgeWarning: {
    backgroundColor: colors.statusIdleBg,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  total: {
    fontSize: 40,
    lineHeight: 46,
    fontFamily: fonts.extrabold,
    letterSpacing: -0.8,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  code: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: colors.textSubtle,
  },
  section: {
    gap: 10,
  },
});
