import { router } from 'expo-router';
import { PlugZap, Zap } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { StatusPill } from '@/components/ui/status-pill';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { ChargePoint } from '@/features/charging/api/charging-api';
import { formatDistance } from '@/features/charging/charge-point-distance';
import {
  chargePointStatusLabels,
  chargePointStatusPill,
  formatCents,
  formatPower,
  regimeLabels,
} from '@/features/charging/charging-format';
import { DemandBadge } from '@/features/charging/components/demand-badge';
import { DistanceTag } from '@/features/charging/components/distance-tag';
import { QueueLengthTag } from '@/features/charging/components/queue-length-tag';

const statusIconColors: Record<ChargePoint['status'], string> = {
  AVAILABLE: colors.statusCharging,
  CHARGING: colors.statusCharging,
  IDLE: colors.statusIdle,
  OFFLINE: colors.statusOffline,
};

const regimeFootnotes: Record<ChargePoint['type'], string> = {
  PRIVATE: 'Condomínio · energia repassada a custo, sem margem',
  COMMERCIAL: 'Comercial · tarifa dinâmica conforme a demanda',
};

export function openChargePoint(chargePointId: string) {
  router.push({ pathname: '/charge-points/[chargePointId]', params: { chargePointId } });
}

export type ChargePointPreviewProps = {
  chargePoint: ChargePoint;
  distanceMeters?: number | null;
};

export function ChargePointPreview({ chargePoint, distanceMeters }: ChargePointPreviewProps) {
  const { pricing } = chargePoint;
  const isAvailable = chargePoint.status === 'AVAILABLE';

  return (
    <View style={styles.preview}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${chargePoint.name}, ${chargePointStatusLabels[chargePoint.status]}${chargePoint.queueLength > 0 ? `, ${chargePoint.queueLength} na fila` : ''}${distanceMeters == null ? '' : `, a ${formatDistance(distanceMeters)}`}`}
        onPress={() => openChargePoint(chargePoint.id)}
        scaleTo={0.99}
        style={styles.header}
      >
        <View style={styles.iconTile}>
          <Icon icon={PlugZap} size={22} color={statusIconColors[chargePoint.status]} />
        </View>
        <View style={styles.titles}>
          <Text numberOfLines={1} style={styles.name}>
            {chargePoint.name}
          </Text>
          <Text numberOfLines={1} style={styles.location}>
            {chargePoint.organizationName} · {chargePoint.code}
          </Text>
          <DistanceTag distanceMeters={distanceMeters} />
        </View>
        <View style={styles.price}>
          {pricing ? (
            <>
              <Text style={styles.priceValue}>{formatCents(pricing.pricePerKwhCents)}</Text>
              <Text style={styles.priceUnit}>por kWh</Text>
            </>
          ) : (
            <Text style={styles.priceUnit}>Sem tarifa</Text>
          )}
        </View>
      </PressableScale>
      <View style={styles.meta}>
        <StatusPill
          status={chargePointStatusPill[chargePoint.status]}
          label={chargePointStatusLabels[chargePoint.status]}
        />
        <QueueLengthTag queueLength={chargePoint.queueLength} />
        <Text style={styles.metaText}>
          {formatPower(chargePoint.maxPowerKw)} · {regimeLabels[chargePoint.type]}
        </Text>
      </View>
      {pricing ? (
        <DemandBadge
          level={pricing.demandLevel}
          factor={pricing.demandFactor}
          source={pricing.demandFactorSource}
          modelVersion={pricing.demandModelVersion}
        />
      ) : null}
      <Button
        label={isAvailable ? 'Ver ponto e continuar' : 'Ver ponto'}
        icon={Zap}
        size="lg"
        block
        haptic
        variant={isAvailable ? 'primary' : 'secondary'}
        onPress={() => openChargePoint(chargePoint.id)}
        style={styles.action}
      />
      <Text style={styles.footnote}>{regimeFootnotes[chargePoint.type]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
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
  location: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 2,
  },
  price: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    fontFamily: fonts.extrabold,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  priceUnit: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaText: {
    flexShrink: 1,
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textSubtle,
  },
  action: {
    marginTop: spacing.xs,
  },
  footnote: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    textAlign: 'center',
  },
});
