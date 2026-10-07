import { Clock, CreditCard, TriangleAlert } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { Card } from '@/components/ui/card';
import { FadeInItem } from '@/components/ui/fade-in-item';
import { InfoBanner } from '@/components/ui/info-banner';
import { ListRow } from '@/components/ui/list-row';
import { MetricTile } from '@/components/ui/metric-tile';
import { ProgressMeter } from '@/components/ui/progress-meter';
import { colors, motion, spacing } from '@/constants/theme';
import type { ChargingSession } from '@/features/charging/api/charging-api';
import {
  formatAmount,
  formatCents,
  formatDemandFactor,
  formatDemandSource,
  formatLimit,
  formatPowerValue,
  formatPricePerKwh,
  formatTime,
  paymentStatusLabels,
} from '@/features/charging/charging-format';
import { ReleasePanel } from '@/features/charging/components/release-panel';
import { SessionHero } from '@/features/charging/components/session-hero';
import { SessionRing } from '@/features/charging/components/session-ring';
import {
  estimateChargingEndMs,
  getChargingProgress,
  getGraceProgress,
  getIdleFeeProgress,
  getRemainingEnergyKwh,
} from '@/features/charging/session-progress';
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
  if (session.status === 'PENDING') return <ReleasePanel session={session} />;
  if (session.status === 'GRACE') return <GracePanel session={session} now={now} />;
  if (session.status === 'IDLE') return <IdlePanel session={session} now={now} />;
  return <ChargingPanel session={session} now={now} />;
}

function ChargingPanel({ session, now }: LiveSessionPanelProps) {
  const elapsed = getChargingSeconds(session, now);
  const isThrottled = session.powerKw < session.allocatedPowerKw;
  const remaining = getRemainingEnergyKwh(session);
  const endsAt = estimateChargingEndMs(session, now);

  return (
    <>
      <SessionRing
        progress={getChargingProgress(session)}
        tone="charging"
        glow
        value={formatEnergy(session.energyKwh, { withUnit: false })}
        unit="kWh"
        label="Energia entregue"
        pillLabel={`Carregando · ${formatDuration(elapsed)}`}
      />
      <FadeInItem index={1}>
        <Card>
          <View style={styles.metrics}>
            <MetricTile
              value={formatPowerValue(session.powerKw)}
              unit="kW"
              label="Potência"
              tone={isThrottled ? 'demand' : 'default'}
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
      </FadeInItem>
      {isThrottled ? (
        <Animated.View
          entering={FadeInDown.duration(280).easing(motion.easing.sheet)}
          exiting={FadeOut.duration(motion.duration.base)}
        >
          <InfoBanner tone="warning" title="Potência reduzida pelo prédio">
            Outros pontos estão em uso e o balanceamento do prédio reduziu a potência. A recarga fica mais longa, mas o
            preço por kWh não muda.
          </InfoBanner>
        </Animated.View>
      ) : null}
      {session.socPercent !== null ? (
        <FadeInItem index={2}>
          <Card>
            <ProgressMeter
              value={session.socPercent}
              segmented
              caption="Bateria do veículo"
              valueLabel={`${Math.round(session.socPercent)} %`}
            />
          </Card>
        </FadeInItem>
      ) : null}
      <FadeInItem index={3}>
        <SessionFacts
          session={session}
          limitHint={remaining === null ? 'Encerra ao completar a carga' : `Faltam ${formatEnergy(remaining)}`}
          estimatedEnd={endsAt === null ? null : `~ ${formatTime(new Date(endsAt).toISOString())}`}
        />
      </FadeInItem>
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
      <FadeInItem index={1}>
        {session.payment?.status === 'FAILED' ? (
          <InfoBanner tone="danger" title="Cartão recusado">
            O cartão não autorizou a pré-autorização. Tente de novo com outro cartão ou cancele a recarga.
          </InfoBanner>
        ) : (
          <InfoBanner tone="info" title="Pagamento pendente">
            O carregador é liberado assim que o cartão autoriza a pré-autorização. Ao encerrar, só o valor consumido é
            cobrado e o restante é liberado.
          </InfoBanner>
        )}
      </FadeInItem>
      <FadeInItem index={2}>
        <SessionFacts session={session} />
      </FadeInItem>
    </>
  );
}

function GracePanel({ session, now }: LiveSessionPanelProps) {
  return (
    <>
      <SessionRing
        progress={getGraceProgress(session, now)}
        tone="idle"
        mono
        value={formatClock(getGraceRemainingSeconds(session, now))}
        label="Restante para retirar o veículo"
        pillLabel="Tolerância gratuita"
        pillIcon={Clock}
      />
      <FadeInItem index={1}>
        <InfoBanner tone="warning" title="Carga concluída">
          {`Retire o veículo em até ${session.gracePeriodMinutes} min e nada é cobrado além da energia. Depois disso, a taxa de ocupação é de ${formatCents(session.idleFeeCentsPerMinute)} por minuto.`}
        </InfoBanner>
      </FadeInItem>
      <FadeInItem index={2}>
        <EnergySummary session={session} idleFeeCents={0} />
      </FadeInItem>
      <FadeInItem index={3}>
        <SessionFacts session={session} />
      </FadeInItem>
    </>
  );
}

function IdlePanel({ session, now }: LiveSessionPanelProps) {
  const idleFeeCents = estimateIdleFeeCents(session, now);
  const reachedCap = idleFeeCents >= session.idleFeeCapCents;

  return (
    <>
      <SessionRing
        progress={getIdleFeeProgress(idleFeeCents, session.idleFeeCapCents)}
        tone="fault"
        glow
        mono
        value={formatClock(getIdleSeconds(session, now))}
        label="Tempo excedente na vaga"
        pillLabel="Taxa de ocupação em curso"
        pillIcon={TriangleAlert}
      />
      <FadeInItem index={1}>
        <InfoBanner tone="danger" title={reachedCap ? 'Teto da taxa atingido' : 'Taxa de ocupação em curso'}>
          {`${formatCents(session.idleFeeCentsPerMinute)} por minuto excedente, até ${formatCents(session.idleFeeCapCents)}. Retire o veículo e encerre a recarga para parar a cobrança.`}
        </InfoBanner>
      </FadeInItem>
      <FadeInItem index={2}>
        <EnergySummary session={session} idleFeeCents={idleFeeCents} />
      </FadeInItem>
      <FadeInItem index={3}>
        <Card>
          <ProgressMeter
            value={idleFeeCents}
            max={session.idleFeeCapCents}
            tone="fault"
            caption="Taxa de ocupação até o teto"
            valueLabel={`${formatCents(idleFeeCents)} / ${formatCents(session.idleFeeCapCents)}`}
          />
        </Card>
      </FadeInItem>
      <FadeInItem index={4}>
        <SessionFacts session={session} />
      </FadeInItem>
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

type SessionFactsProps = {
  session: ChargingSession;
  limitHint?: string;
  estimatedEnd?: string | null;
};

function SessionFacts({ session, limitHint, estimatedEnd }: SessionFactsProps) {
  const hasPayment = session.payment !== null;
  const isAccelerated = session.simulationSpeed > 1;
  const hasEstimate = Boolean(estimatedEnd);

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
      <ListRow
        label="Limite da recarga"
        value={formatLimit(session.limit)}
        hint={limitHint}
        divider={hasEstimate || hasPayment || isAccelerated}
      />
      {estimatedEnd ? (
        <ListRow
          label="Término estimado"
          value={estimatedEnd}
          hint="Pela potência atual"
          divider={hasPayment || isAccelerated}
        />
      ) : null}
      {session.payment ? (
        <ListRow
          label="Pré-autorização"
          value={formatCents(session.payment.authorizedCents)}
          hint={`${paymentStatusLabels[session.payment.status]} · só o consumido é cobrado`}
          divider={isAccelerated}
        />
      ) : null}
      {isAccelerated ? (
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
