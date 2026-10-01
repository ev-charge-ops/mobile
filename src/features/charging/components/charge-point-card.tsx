import { Plug } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { StatusPill } from '@/components/ui/status-pill';
import { fonts, nightColors, radii, spacing } from '@/constants/theme';
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

export type ChargePointCardProps = {
  chargePoint: ChargePoint;
  distanceMeters?: number | null;
  onPress: () => void;
};

const statusIconColors: Record<ChargePoint['status'], string> = {
  AVAILABLE: nightColors.energy,
  CHARGING: nightColors.warning,
  IDLE: nightColors.warning,
  OFFLINE: nightColors.textMuted,
};

export function ChargePointCard({ chargePoint, distanceMeters, onPress }: ChargePointCardProps) {
  const { pricing } = chargePoint;
  const queue = chargePoint.queueLength > 0 ? `, ${chargePoint.queueLength} na fila` : '';
  const distance = distanceMeters == null ? '' : `, a ${formatDistance(distanceMeters)}`;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${chargePoint.name}, ${chargePointStatusLabels[chargePoint.status]}${queue}${distance}`}
      onPress={onPress}
      scaleTo={0.98}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.iconTile}>
          <Icon icon={Plug} size={22} color={statusIconColors[chargePoint.status]} />
        </View>
        <View style={styles.titles}>
          <Text style={styles.name}>{chargePoint.name}</Text>
          <Text style={styles.location}>
            {chargePoint.organizationName} · {chargePoint.code}
          </Text>
          <DistanceTag distanceMeters={distanceMeters} scheme="night" />
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
      </View>
      <View style={styles.meta}>
        <StatusPill
          status={chargePointStatusPill[chargePoint.status]}
          label={chargePointStatusLabels[chargePoint.status]}
          scheme="night"
        />
        <QueueLengthTag queueLength={chargePoint.queueLength} scheme="night" />
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
          scheme="night"
        />
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.card + 4,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: nightColors.borderSubtle,
    backgroundColor: nightColors.surfaceCard,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: nightColors.surfaceInset,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: nightColors.textTitle,
  },
  location: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
    marginTop: 2,
  },
  price: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    fontFamily: fonts.extrabold,
    color: nightColors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  priceUnit: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
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
    color: nightColors.textMuted,
  },
});
