import { ChevronRight, Plug } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { fonts, nightColors, palette, radii, spacing } from '@/constants/theme';
import { formatDistance } from '@/features/charging/charge-point-distance';
import { formatQueueLength } from '@/features/charging/charge-point-queue';
import type { ChargePointSummary } from '@/features/charging/charge-point-summary';
import { chargePointStatusShortLabels, formatPricePerKwh } from '@/features/charging/charging-format';
import { DemoPriceTag } from '@/features/charging/components/demo-price-tag';
import { QueueLengthTag } from '@/features/charging/components/queue-length-tag';

const tileColors: Record<ChargePointSummary['status'], { background: string; icon: string }> = {
  AVAILABLE: { background: '#0F2A1B', icon: palette.green500 },
  CHARGING: { background: '#2E220F', icon: palette.amber500 },
  IDLE: { background: '#2E220F', icon: palette.amber500 },
  OFFLINE: { background: nightColors.surfaceInset, icon: nightColors.textMuted },
};

export function describeChargePointHeadline(chargePoint: ChargePointSummary, distanceMeters: number | null | undefined) {
  const status = `${chargePoint.code} ${chargePointStatusShortLabels[chargePoint.status]}`;
  return distanceMeters == null ? status : `${status} a ${formatDistance(distanceMeters)}`;
}

export function describeChargePointDetails(chargePoint: ChargePointSummary) {
  const price = chargePoint.pricePerKwhCents === null ? 'Sem tarifa' : formatPricePerKwh(chargePoint.pricePerKwhCents);
  return `${chargePoint.name} · ${price}`;
}

export type ChargePointMapCardProps = {
  chargePoint: ChargePointSummary;
  distanceMeters?: number | null;
  onPress: () => void;
};

export function ChargePointMapCard({ chargePoint, distanceMeters, onPress }: ChargePointMapCardProps) {
  const headline = describeChargePointHeadline(chargePoint, distanceMeters);
  const details = describeChargePointDetails(chargePoint);
  const tile = tileColors[chargePoint.status];
  const queue = chargePoint.queueLength > 0 ? `, ${formatQueueLength(chargePoint.queueLength)}` : '';
  const demo = chargePoint.isDemoPrice ? ', preço de demonstração' : '';

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${headline}, ${details}${queue}${demo}`}
      accessibilityHint="Abre os detalhes do ponto"
      onPress={onPress}
      haptic="selection"
      scaleTo={0.98}
      testID="charge-point-map-card"
      style={styles.card}
    >
      <View style={[styles.tile, { backgroundColor: tile.background }]}>
        <Icon icon={Plug} size={22} color={tile.icon} />
      </View>
      <View style={styles.texts}>
        <Text numberOfLines={1} style={styles.headline}>
          {headline}
        </Text>
        <Text numberOfLines={1} style={styles.details}>
          {details}
        </Text>
        {chargePoint.isDemoPrice ? <DemoPriceTag scheme="night" /> : null}
      </View>
      <QueueLengthTag queueLength={chargePoint.queueLength} scheme="night" />
      <Icon icon={ChevronRight} size={18} color={nightColors.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radii.card + 4,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: nightColors.borderSubtle,
    backgroundColor: nightColors.surfaceCard,
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  headline: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: nightColors.textTitle,
  },
  details: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
  },
});
