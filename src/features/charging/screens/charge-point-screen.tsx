import { router } from 'expo-router';
import { PlugZap, RotateCw, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card, Divider, SectionTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { InfoBanner } from '@/components/ui/info-banner';
import { ListRow } from '@/components/ui/list-row';
import { MetricTile } from '@/components/ui/metric-tile';
import { StatusPill } from '@/components/ui/status-pill';
import { colors, fonts, radii, spacing, typography } from '@/constants/theme';
import { ChargingApiError, type ChargePoint, type ChargePointPricing } from '@/features/charging/api/charging-api';
import { useChargePoint } from '@/features/charging/api/use-charge-points';
import {
  chargePointStatusLabels,
  chargePointStatusPill,
  connectorLabels,
  formatAmount,
  formatCents,
  formatDemandFactor,
  formatPower,
  formatPowerValue,
  formatPricePerKwh,
  regimeLabels,
} from '@/features/charging/charging-format';
import { DemandBadge } from '@/features/charging/components/demand-badge';
import { StartChargingSheet } from '@/features/charging/components/start-charging-sheet';

const ESTIMATE_ENERGY_KWH = 20;

export type ChargePointScreenProps = {
  chargePointId: string;
};

const unavailableLabels: Record<ChargePoint['status'], string> = {
  AVAILABLE: 'Iniciar recarga',
  CHARGING: 'Ponto em uso',
  IDLE: 'Ponto ocupado',
  OFFLINE: 'Carregador offline',
};

export function ChargePointScreen({ chargePointId }: ChargePointScreenProps) {
  const { data: chargePoint, isPending, isError, error, refetch, isRefetching } = useChargePoint(chargePointId);
  const [isConfirming, setConfirming] = useState(false);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
        <AppBar title="Ponto de recarga" onBack={() => router.back()} />
        {chargePoint ? (
          <>
            <ScrollView contentContainerStyle={styles.content}>
              <ChargePointDetails chargePoint={chargePoint} />
            </ScrollView>
            <StartFooter chargePoint={chargePoint} onStart={() => setConfirming(true)} />
          </>
        ) : isPending ? (
          <View style={styles.centered}>
            <ActivityIndicator accessibilityLabel="Carregando ponto de recarga" color={colors.accent} size="large" />
          </View>
        ) : (
          <View style={[styles.content, styles.stack]}>
            <Card style={styles.stack}>
              <Text style={typography.body}>
                {isError && error instanceof ChargingApiError && error.status === 404
                  ? 'Este ponto de recarga não existe ou não está disponível para você.'
                  : 'Não foi possível carregar o ponto de recarga.'}
              </Text>
              <Button
                label="Tentar novamente"
                icon={RotateCw}
                variant="secondary"
                size="sm"
                loading={isRefetching}
                onPress={() => refetch()}
              />
            </Card>
          </View>
        )}
      </SafeAreaView>
      {chargePoint?.pricing ? (
        <StartChargingSheet
          chargePoint={chargePoint}
          pricing={chargePoint.pricing}
          visible={isConfirming}
          onClose={() => setConfirming(false)}
        />
      ) : null}
    </View>
  );
}

function StartFooter({ chargePoint, onStart }: { chargePoint: ChargePoint; onStart: () => void }) {
  const needsCardPayment = chargePoint.type === 'COMMERCIAL';
  const canStart = chargePoint.status === 'AVAILABLE' && chargePoint.pricing !== null && !needsCardPayment;
  const label = chargePoint.pricing ? unavailableLabels[chargePoint.status] : 'Tarifa não configurada';

  return (
    <View style={styles.footer}>
      <Button label={label} icon={Zap} size="lg" block disabled={!canStart} onPress={onStart} />
      <Text style={styles.footnote}>
        {needsCardPayment
          ? 'O pagamento com cartão chega na próxima versão do app'
          : 'Sem cartão · o consumo entra no rateio da sua unidade'}
      </Text>
    </View>
  );
}

function ChargePointDetails({ chargePoint }: { chargePoint: ChargePoint }) {
  const { pricing, charger } = chargePoint;

  return (
    <>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon icon={PlugZap} size={32} color={colors.textDisabled} />
        </View>
        <Text style={styles.heroTitle}>{chargePoint.name}</Text>
        <Text style={styles.heroSubtitle}>
          {chargePoint.organizationName} · {chargePoint.code}
        </Text>
        <View style={styles.heroMeta}>
          <StatusPill
            status={chargePointStatusPill[chargePoint.status]}
            label={chargePointStatusLabels[chargePoint.status]}
          />
          <Text style={styles.heroMetaText}>{regimeLabels[chargePoint.type]}</Text>
        </View>
      </View>

      {pricing ? (
        <>
          <PricingCard pricing={pricing} maxPowerKw={chargePoint.maxPowerKw} />
          <RegimeBanner type={chargePoint.type} pricing={pricing} />
          <View style={styles.section}>
            <SectionTitle>Como a conta é composta</SectionTitle>
            <Card padding={0}>
              <ListRow
                label="Energia"
                value={formatPricePerKwh(pricing.pricePerKwhCents)}
                hint={
                  pricing.demandFactorApplied && pricing.baseRateCents !== null
                    ? `Tarifa base ${formatPricePerKwh(pricing.baseRateCents)} × fator ${formatDemandFactor(pricing.demandFactor)}`
                    : 'Tarifa da concessionária, sem margem'
                }
              />
              <ListRow
                label="Tolerância"
                value={`${pricing.gracePeriodMinutes} min`}
                hint="Sem cobrança depois que a carga termina"
              />
              <ListRow
                label="Taxa de ocupação"
                value={`${formatCents(pricing.idleFeeCentsPerMinute)}/min`}
                hint={`Após a tolerância, até ${formatCents(pricing.idleFeeCapCents)} por sessão`}
                divider={false}
              />
            </Card>
          </View>
        </>
      ) : (
        <InfoBanner tone="warning" title="Tarifa não configurada">
          O gestor ainda não definiu a tarifa deste ponto, por isso não é possível iniciar uma recarga.
        </InfoBanner>
      )}

      {charger ? (
        <View style={styles.section}>
          <SectionTitle>Carregador</SectionTitle>
          <Card padding={0}>
            <ListRow label="Modelo" value={charger.vendor} />
            <ListRow label="Conector" value={connectorLabels[charger.connector]} />
            <ListRow label="Potência máxima" value={formatPower(chargePoint.maxPowerKw)} divider={false} />
          </Card>
        </View>
      ) : null}
    </>
  );
}

function PricingCard({ pricing, maxPowerKw }: { pricing: ChargePointPricing; maxPowerKw: number }) {
  return (
    <Card style={styles.stack}>
      <View style={styles.metrics}>
        <MetricTile
          value={formatAmount(pricing.pricePerKwhCents)}
          unit="R$/kWh"
          label="Preço agora"
          style={styles.metric}
        />
        <MetricTile value={formatPowerValue(maxPowerKw)} unit="kW" label="Potência" style={styles.metric} />
        <MetricTile
          value={formatDemandFactor(pricing.demandFactor)}
          label="Fator de demanda"
          tone={pricing.demandLevel === 'PEAK' ? 'demand' : 'default'}
          style={styles.metric}
        />
      </View>
      <DemandBadge
        level={pricing.demandLevel}
        factor={pricing.demandFactor}
        source={pricing.demandFactorSource}
        modelVersion={pricing.demandModelVersion}
      />
      <Divider />
      <View style={styles.estimate}>
        <Text style={styles.estimateLabel}>Custo estimado · {ESTIMATE_ENERGY_KWH} kWh</Text>
        <Text style={styles.estimateValue}>{formatCents(pricing.pricePerKwhCents * ESTIMATE_ENERGY_KWH)}</Text>
      </View>
    </Card>
  );
}

function RegimeBanner({ type, pricing }: { type: ChargePoint['type']; pricing: ChargePointPricing }) {
  if (type === 'PRIVATE') {
    return (
      <InfoBanner tone="success" title="Condomínio · energia a custo">
        A energia é repassada pela tarifa da concessionária, sem margem. O fator de demanda indica horários disputados e
        não altera o preço do kWh.
      </InfoBanner>
    );
  }

  return (
    <InfoBanner tone="info" title="Rede comercial · tarifa dinâmica">
      {pricing.baseRateCents !== null
        ? `O fator de demanda multiplica a tarifa base de ${formatPricePerKwh(pricing.baseRateCents)}. O preço fica travado quando a recarga começa.`
        : 'O fator de demanda multiplica a tarifa base. O preço fica travado quando a recarga começa.'}
    </InfoBanner>
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
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    gap: spacing.md,
  },
  section: {
    gap: 10,
  },
  hero: {
    padding: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceCard,
    overflow: 'hidden',
  },
  heroIcon: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  heroTitle: {
    ...typography.title,
    maxWidth: 260,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: spacing.xs,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 14,
  },
  heroMetaText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textSubtle,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metric: {
    flex: 1,
  },
  estimate: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  estimateLabel: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  footer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surfaceSheet,
  },
  footnote: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  estimateValue: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
});
