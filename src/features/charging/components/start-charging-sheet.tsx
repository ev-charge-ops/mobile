import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { CreditCard, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { ListRow } from '@/components/ui/list-row';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import {
  getActiveSession,
  type ChargePoint,
  type ChargePointPricing,
} from '@/features/charging/api/charging-api';
import {
  activeSessionQueryKey,
  usePayForSession,
  useStartSession,
} from '@/features/charging/api/use-charging-sessions';
import { getStartSessionErrorMessage, isActiveSessionConflict } from '@/features/charging/charging-errors';
import { DEFAULT_LIMIT_DRAFT, toLimitInput, type LimitDraft } from '@/features/charging/charging-limit';
import {
  demandLevelLabels,
  formatCents,
  formatDemandFactor,
  formatDemandSource,
  formatPricePerKwh,
} from '@/features/charging/charging-format';
import { ChargingLimitPicker } from '@/features/charging/components/charging-limit-picker';

export type StartChargingSheetProps = {
  chargePoint: ChargePoint;
  pricing: ChargePointPricing;
  visible: boolean;
  onClose: () => void;
};

export function StartChargingSheet({ chargePoint, pricing, visible, onClose }: StartChargingSheetProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const startSession = useStartSession();
  const payForSession = usePayForSession();
  const needsCardPayment = chargePoint.type === 'COMMERCIAL';
  const [limit, setLimit] = useState<LimitDraft>(DEFAULT_LIMIT_DRAFT);

  const openActiveSession = async () => {
    const active = await queryClient.fetchQuery({ queryKey: activeSessionQueryKey, queryFn: getActiveSession });
    if (!active) return;
    onClose();
    router.replace({ pathname: '/sessions/[sessionId]', params: { sessionId: active.id } });
  };

  const start = () => {
    startSession.mutate(
      { chargePointId: chargePoint.id, limit: toLimitInput(limit, pricing.pricePerKwhCents) },
      {
        onSuccess: (session) => {
          onClose();
          router.replace({ pathname: '/sessions/[sessionId]', params: { sessionId: session.id } });
          if (session.status === 'AWAITING_PAYMENT') {
            payForSession.mutate({ sessionId: session.id, sheet: session.paymentSheet });
            return;
          }
          toast.show('Carregador liberado. Recarga iniciada!');
        },
        onError: (error) => {
          if (isActiveSessionConflict(error)) {
            toast.show('Você já tem uma recarga em andamento.', { tone: 'info' });
            openActiveSession().catch(() => undefined);
          }
        },
      },
    );
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text accessibilityRole="header" style={typography.heading}>
            Confirmar recarga
          </Text>
          <Text style={styles.subtitle}>{chargePoint.name}</Text>
        </View>
        <Card padding={0} style={styles.inset}>
          <ListRow
            label="Preço por kWh"
            value={formatPricePerKwh(pricing.pricePerKwhCents)}
            hint="Travado quando a recarga começa"
          />
          <ListRow
            label="Demanda agora"
            value={`${demandLevelLabels[pricing.demandLevel]} · ${formatDemandFactor(pricing.demandFactor)}`}
            hint={formatDemandSource(pricing.demandFactorSource, pricing.demandModelVersion)}
          />
          <ListRow
            label="Taxa de ocupação"
            value={`${formatCents(pricing.idleFeeCentsPerMinute)}/min`}
            hint={`Só depois de ${pricing.gracePeriodMinutes} min de tolerância`}
            divider={needsCardPayment}
          />
          {needsCardPayment ? (
            <ListRow
              icon={CreditCard}
              label="Pagamento no cartão"
              value="Pré-autorização"
              hint="Reservamos o valor máximo e cobramos só o consumido ao encerrar"
              divider={false}
            />
          ) : null}
        </Card>
        <View style={styles.section}>
          <SectionTitle>Limite da recarga</SectionTitle>
          <ChargingLimitPicker value={limit} onChange={setLimit} pricePerKwhCents={pricing.pricePerKwhCents} />
        </View>
        {startSession.isError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {getStartSessionErrorMessage(startSession.error)}
          </Text>
        ) : null}
        <Button
          label={needsCardPayment ? 'Continuar para pagamento' : 'Confirmar e iniciar'}
          icon={needsCardPayment ? CreditCard : Zap}
          size="lg"
          block
          haptic
          loading={startSession.isPending}
          onPress={start}
        />
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 2,
  },
  inset: {
    backgroundColor: colors.surfaceCard,
  },
  section: {
    gap: 10,
  },
  error: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.statusFault,
  },
});
