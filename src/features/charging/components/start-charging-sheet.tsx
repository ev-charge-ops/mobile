import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Zap } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { ListRow } from '@/components/ui/list-row';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import {
  getActiveSession,
  type ChargePoint,
  type ChargePointPricing,
  type ChargingLimitInput,
} from '@/features/charging/api/charging-api';
import { activeSessionQueryKey, useStartSession } from '@/features/charging/api/use-charging-sessions';
import { getStartSessionErrorMessage, isActiveSessionConflict } from '@/features/charging/charging-errors';
import {
  demandLevelLabels,
  formatCents,
  formatDemandFactor,
  formatDemandSource,
  formatPricePerKwh,
} from '@/features/charging/charging-format';

type LimitOption = { id: string; label: string; limit: ChargingLimitInput };

const limitOptions: LimitOption[] = [
  { id: 'FULL', label: 'Até completar', limit: { type: 'FULL' } },
  { id: 'ENERGY_10', label: '10 kWh', limit: { type: 'ENERGY', value: 10 } },
  { id: 'ENERGY_20', label: '20 kWh', limit: { type: 'ENERGY', value: 20 } },
  { id: 'AMOUNT_2000', label: 'R$ 20', limit: { type: 'AMOUNT', value: 2000 } },
];

export type StartChargingSheetProps = {
  chargePoint: ChargePoint;
  pricing: ChargePointPricing;
  visible: boolean;
  onClose: () => void;
};

function describeLimit(option: LimitOption, pricing: ChargePointPricing) {
  if (option.limit.type === 'ENERGY' && option.limit.value) {
    return `Custo estimado de ${formatCents(option.limit.value * pricing.pricePerKwhCents)}`;
  }
  if (option.limit.type === 'AMOUNT' && option.limit.value) {
    return 'A recarga para ao atingir o valor de energia';
  }
  return 'A recarga para quando a bateria completar';
}

export function StartChargingSheet({ chargePoint, pricing, visible, onClose }: StartChargingSheetProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const startSession = useStartSession();
  const [limitId, setLimitId] = useState(limitOptions[0].id);
  const selected = limitOptions.find((option) => option.id === limitId) ?? limitOptions[0];

  const openActiveSession = async () => {
    const active = await queryClient.fetchQuery({ queryKey: activeSessionQueryKey, queryFn: getActiveSession });
    if (!active) return;
    onClose();
    router.replace({ pathname: '/sessions/[sessionId]', params: { sessionId: active.id } });
  };

  const start = () => {
    startSession.mutate(
      { chargePointId: chargePoint.id, limit: selected.limit },
      {
        onSuccess: (session) => {
          onClose();
          toast.show('Carregador liberado. Recarga iniciada!');
          router.replace({ pathname: '/sessions/[sessionId]', params: { sessionId: session.id } });
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
            divider={false}
          />
        </Card>
        <View style={styles.section}>
          <SectionTitle>Limite da recarga</SectionTitle>
          <View style={styles.limits}>
            {limitOptions.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                selected={option.id === limitId}
                onPress={() => setLimitId(option.id)}
              />
            ))}
          </View>
          <Text style={styles.hint}>{describeLimit(selected, pricing)}</Text>
        </View>
        {startSession.isError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {getStartSessionErrorMessage(startSession.error)}
          </Text>
        ) : null}
        <Button
          label="Confirmar e iniciar"
          icon={Zap}
          size="lg"
          block
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
  limits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hint: {
    ...typography.caption,
  },
  error: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.statusFault,
  },
});
