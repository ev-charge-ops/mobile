import { CreditCard } from 'lucide-react-native';

import { Card } from '@/components/ui/card';
import { FadeInItem } from '@/components/ui/fade-in-item';
import { InfoBanner } from '@/components/ui/info-banner';
import { ListRow } from '@/components/ui/list-row';
import { colors } from '@/constants/theme';
import type { ChargingSession } from '@/features/charging/api/charging-api';
import {
  formatCents,
  formatDemandFactor,
  formatDemandSource,
  formatLimit,
  formatPricePerKwh,
  paymentStatusLabels,
} from '@/features/charging/charging-format';
import { ReleasePanel } from '@/features/charging/components/release-panel';
import { SessionHero } from '@/features/charging/components/session-hero';

export type LiveSessionPanelProps = {
  session: ChargingSession;
};

export function LiveSessionPanel({ session }: LiveSessionPanelProps) {
  if (session.status === 'AWAITING_PAYMENT') return <PaymentPendingPanel session={session} />;
  return <ReleasePanel session={session} />;
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
