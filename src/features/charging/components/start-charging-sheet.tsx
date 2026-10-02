import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { CircleAlert, CreditCard, Lock, Sparkles, Timer, X, Zap, type LucideIcon } from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, palette, radii, spacing } from '@/constants/theme';
import { getActiveSession, type ChargePoint, type ChargePointPricing } from '@/features/charging/api/charging-api';
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
  formatPower,
  formatPricePerKwh,
} from '@/features/charging/charging-format';
import { ChargingLimitPicker } from '@/features/charging/components/charging-limit-picker';

export const regimeGroupLabels: Record<ChargePoint['type'], string> = {
  PRIVATE: 'Grupo A',
  COMMERCIAL: 'Grupo B',
};

type Term = { icon: LucideIcon; title: string; body: string };

export function getStartTerms(chargePoint: ChargePoint, pricing: ChargePointPricing): Term[] {
  const isPrivate = chargePoint.type === 'PRIVATE';
  return [
    {
      icon: Lock,
      title: 'Tarifa travada no início',
      body: isPrivate
        ? `${formatPricePerKwh(pricing.pricePerKwhCents)}, repassada a custo`
        : `${formatPricePerKwh(pricing.pricePerKwhCents)}, com pré-autorização no cartão`,
    },
    {
      icon: Sparkles,
      title: `${demandLevelLabels[pricing.demandLevel]} · ${formatDemandFactor(pricing.demandFactor)}`,
      body: formatDemandSource(pricing.demandFactorSource, pricing.demandModelVersion),
    },
    {
      icon: Timer,
      title: `Tolerância de ${pricing.gracePeriodMinutes} min`,
      body: 'após a carga completa para retirar o veículo',
    },
    {
      icon: CircleAlert,
      title: 'Multa de ocupação',
      body:
        `de ${formatCents(pricing.idleFeeCentsPerMinute)}/min após a tolerância, ` +
        `com teto de ${formatCents(pricing.idleFeeCapCents)}`,
    },
  ];
}

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
  const terms = getStartTerms(chargePoint, pricing);

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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titles}>
            <Text accessibilityRole="header" style={styles.title}>
              Iniciar recarga · {chargePoint.code}
            </Text>
            <Text style={styles.subtitle}>
              {[chargePoint.name, formatPower(chargePoint.maxPowerKw), regimeGroupLabels[chargePoint.type]].join(' · ')}
            </Text>
          </View>
          <IconButton icon={X} tone="inset" accessibilityLabel="Fechar" onPress={onClose} />
        </View>
        <ChargingLimitPicker
          value={limit}
          onChange={setLimit}
          pricePerKwhCents={pricing.pricePerKwhCents}
          maxPowerKw={chargePoint.maxPowerKw}
        />
        <View style={styles.terms}>
          {terms.map((term, index) => (
            <Fragment key={term.title}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.term}>
                <Icon icon={term.icon} size={18} color={colors.textMuted} style={styles.termIcon} />
                <Text style={styles.termText}>
                  <Text style={styles.termTitle}>{term.title}</Text> · {term.body}
                </Text>
              </View>
            </Fragment>
          ))}
        </View>
        {startSession.isError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {getStartSessionErrorMessage(startSession.error)}
          </Text>
        ) : null}
        <Button
          label={needsCardPayment ? 'Continuar para pagamento' : 'Conectar e iniciar'}
          icon={needsCardPayment ? CreditCard : undefined}
          trailingIcon={needsCardPayment ? undefined : Zap}
          trailingIconColor={palette.green500}
          size="xl"
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  titles: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 26,
    lineHeight: 29,
    fontFamily: fonts.bold,
    letterSpacing: -0.8,
    color: colors.textTitle,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  terms: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceInset,
  },
  term: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: 10,
  },
  termIcon: {
    marginTop: 1,
  },
  termText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textBody,
  },
  termTitle: {
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  error: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.statusFault,
  },
});
