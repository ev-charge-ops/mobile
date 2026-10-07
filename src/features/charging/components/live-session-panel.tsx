import { BatteryCharging, Clock, CreditCard, Hourglass, TriangleAlert } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { InfoBanner } from '@/components/ui/info-banner';
import { ListRow } from '@/components/ui/list-row';
import { MetricTile } from '@/components/ui/metric-tile';
import { ProgressMeter } from '@/components/ui/progress-meter';
import { colors, spacing } from '@/constants/theme';
import type { ChargingSession } from '@/features/charging/api/charging-api';
import {
  formatAmount,
  formatCents,
  formatDemandFactor,
  formatDemandSource,
  formatLimit,
  formatPowerValue,
  formatPricePerKwh,
} from '@/features/charging/charging-format';
import { SessionHero } from '@/features/charging/components/session-hero';
import {
  estimateIdleFeeCents,
  formatClock,
  formatDuration,
  getChargingSeconds,
  getGraceRemainingSeconds,
  getIdleSeconds,
} from '@/features/charging/session-timing';
import { formatEnergy } from '@/utils/format-energy';

export type LiveSessionPanelProps = {
  session: ChargingSession;
  now: number;
};

export function LiveSessionPanel({ session, now }: LiveSessionPanelProps) {
  if (session.status === 'AWAITING_PAYMENT') return <PaymentPendingPanel session={session} />;
  if (session.status === 'GRACE') return <GracePanel session={session} now={now} />;
  if (session.status === 'IDLE') return <IdlePanel session={session} now={now} />;
  return <ChargingPanel session={session} now={now} />;
}

function ChargingPanel({ session, now }: LiveSessionPanelProps) {
  const isPending = session.status === 'PENDING';
  const elapsed = getChargingSeconds(session, now);

  return (
    <>
      <SessionHero
        value={formatEnergy(session.energyKwh, { withUnit: false })}
        unit="kWh"
        label="Energia entregue"
        pillLabel={isPending ? 'Liberando o carregador' : `Carregando · ${formatDuration(elapsed)}`}
        pillIcon={isPending ? Hourglass : BatteryCharging}
        color={colors.statusCharging}
        backgroundColor={colors.statusChargingBg}
      />
      <Card>
        <View style={styles.metrics}>
          <MetricTile
            value={formatPowerValue(session.powerKw)}
            unit="kW"
            label="Potência"
            tone={session.powerKw < session.allocatedPowerKw ? 'demand' : 'default'}
            style={styles.metric}
          />
          <MetricTile value={formatClock(elapsed)} label="Tempo" style={styles.metric} />
          <MetricTile
            value={formatAmount(session.energyCostCents)}
            unit="R$"
            label="Custo até agora"
            tone="charging"
            style={styles.metric}
          />
        </View>
      </Card>
      {session.socPercent !== null || session.targetEnergyKwh !== null ? (
        <Card style={styles.stack}>
          {session.socPercent !== null ? (
            <ProgressMeter
              value={session.socPercent}
              caption="Bateria do veículo"
              valueLabel={`${Math.round(session.socPercent)} %`}
            />
          ) : null}
          {session.targetEnergyKwh !== null ? (
            <ProgressMeter
              value={session.energyKwh}
              max={session.targetEnergyKwh}
              caption="Meta de energia"
              valueLabel={`${formatEnergy(session.energyKwh, { withUnit: false })} / ${formatEnergy(session.targetEnergyKwh)}`}
            />
          ) : null}
        </Card>
      ) : null}
      {session.powerKw < session.allocatedPowerKw && !isPending ? (
        <InfoBanner tone="warning" title="Potência reduzida pelo prédio">
          Outros pontos estão em uso e o balanceamento do prédio reduziu a potência. A recarga fica mais longa, mas o
          preço por kWh não muda.
        </InfoBanner>
      ) : null}
      <SessionFacts session={session} />
    </>
  );
}

function PaymentPendingPanel({ session }: { session: ChargingSession }) {
  return (
    <>
      <SessionHero
        value={formatCents(session.payment?.authorizedCents ?? 0)}
        label="Pré-autorização no cartão"
        pillLabel="Aguardando pagamento"
        pillIcon={CreditCard}
        color={colors.statusInfo}
        backgroundColor={colors.statusInfoBg}
      />
      <InfoBanner tone="info" title="Pagamento pendente">
        O carregador é liberado depois que o cartão autoriza a pré-autorização. Esta versão do app ainda não aceita
        cartão: cancele a recarga e atualize o app para pagar em pontos comerciais.
      </InfoBanner>
      <SessionFacts session={session} />
    </>
  );
}

function GracePanel({ session, now }: LiveSessionPanelProps) {
  return (
    <>
      <SessionHero
        value={formatClock(getGraceRemainingSeconds(session, now))}
        label="Restante para retirar o veículo"
        pillLabel="Tolerância gratuita"
        pillIcon={Clock}
        color={colors.statusIdle}
        backgroundColor={colors.statusIdleBg}
      />
      <InfoBanner tone="warning" title="Carga concluída">
        {`Retire o veículo em até ${session.gracePeriodMinutes} min e nada é cobrado além da energia. Depois disso, a taxa de ocupação é de ${formatCents(session.idleFeeCentsPerMinute)} por minuto.`}
      </InfoBanner>
      <EnergySummary session={session} idleFeeCents={0} />
      <SessionFacts session={session} />
    </>
  );
}

function IdlePanel({ session, now }: LiveSessionPanelProps) {
  const idleFeeCents = estimateIdleFeeCents(session, now);
  const reachedCap = idleFeeCents >= session.idleFeeCapCents;

  return (
    <>
      <SessionHero
        value={formatClock(getIdleSeconds(session, now))}
        label="Tempo excedente na vaga"
        pillLabel="Taxa de ocupação em curso"
        pillIcon={TriangleAlert}
        color={colors.statusFault}
        backgroundColor={colors.statusFaultBg}
      />
      <InfoBanner tone="danger" title={reachedCap ? 'Teto da taxa atingido' : 'Taxa de ocupação em curso'}>
        {`${formatCents(session.idleFeeCentsPerMinute)} por minuto excedente, até ${formatCents(session.idleFeeCapCents)}. Retire o veículo e encerre a recarga para parar a cobrança.`}
      </InfoBanner>
      <EnergySummary session={session} idleFeeCents={idleFeeCents} />
      <Card>
        <ProgressMeter
          value={idleFeeCents}
          max={session.idleFeeCapCents}
          tone="fault"
          caption="Taxa de ocupação até o teto"
          valueLabel={`${formatCents(idleFeeCents)} / ${formatCents(session.idleFeeCapCents)}`}
        />
      </Card>
      <SessionFacts session={session} />
    </>
  );
}

function EnergySummary({ session, idleFeeCents }: { session: ChargingSession; idleFeeCents: number }) {
  return (
    <Card style={styles.stack}>
      <View style={styles.metrics}>
        <MetricTile
          value={formatEnergy(session.energyKwh, { withUnit: false })}
          unit="kWh"
          label="Energia"
          style={styles.metric}
        />
        <MetricTile
          value={formatAmount(session.energyCostCents)}
          unit="R$"
          label="Custo da energia"
          style={styles.metric}
        />
        <MetricTile
          value={formatAmount(idleFeeCents)}
          unit="R$"
          label="Ocupação"
          tone={idleFeeCents > 0 ? 'fault' : 'default'}
          style={styles.metric}
        />
      </View>
      <MetricTile value={formatCents(session.energyCostCents + idleFeeCents)} label="Total até agora" size="lg" />
    </Card>
  );
}

function SessionFacts({ session }: { session: ChargingSession }) {
  return (
    <Card padding={0}>
      <ListRow label="Ponto" value={session.chargePoint.name} hint={session.chargePoint.code} />
      <ListRow
        label="Tarifa travada"
        value={formatPricePerKwh(session.lockedRateCents)}
        hint="Definida no início da recarga"
      />
      <ListRow
        label="Fator de demanda"
        value={formatDemandFactor(session.demandFactor)}
        hint={formatDemandSource(session.demandFactorSource, session.demandModelVersion)}
      />
      <ListRow label="Limite" value={formatLimit(session.limit)} divider={session.simulationSpeed > 1} />
      {session.simulationSpeed > 1 ? (
        <ListRow
          label="Simulação acelerada"
          value={`${session.simulationSpeed}×`}
          hint="Cada segundo real equivale a mais tempo de recarga"
          divider={false}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metric: {
    flex: 1,
  },
});
