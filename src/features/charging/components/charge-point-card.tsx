import { Image } from 'expo-image';
import { Building2, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ProgressMeter } from '@/components/ui/progress-meter';
import { RingMark } from '@/components/ui/ring-mark';
import { StatusDot } from '@/components/ui/status-pill';
import { colors, fonts, motion, radii, spacing } from '@/constants/theme';
import type { ChargePoint } from '@/features/charging/api/charging-api';
import { formatDistance } from '@/features/charging/charge-point-distance';
import { formatQueueLength } from '@/features/charging/charge-point-queue';
import {
  chargePointStatusLabels,
  formatAmount,
  formatPower,
  formatPricePerKwh,
  splitChargePointName,
} from '@/features/charging/charging-format';

export type MyChargeSummary = {
  socPercent: number | null;
  limitSocPercent: number | null;
  readyAt: string | null;
};

export type ChargePointCardProps = {
  chargePoint: ChargePoint;
  distanceMeters?: number | null;
  myCharge?: MyChargeSummary | null;
  onPress: () => void;
};

type Pill = { label: string; color: string; background: string; dot: string };

export function getListStatusPill(chargePoint: ChargePoint): Pill {
  if (chargePoint.status === 'OFFLINE') {
    return { label: 'Offline', color: colors.textMuted, background: colors.surfaceInset, dot: colors.textDisabled };
  }
  if (chargePoint.status !== 'AVAILABLE') {
    return {
      label: chargePointStatusLabels[chargePoint.status],
      color: colors.warningText,
      background: colors.warningTint,
      dot: colors.warning,
    };
  }
  if (chargePoint.pricing?.demandLevel === 'PEAK') {
    return { label: 'Pico', color: colors.warningText, background: colors.warningTint, dot: colors.warning };
  }
  return { label: 'Livre', color: colors.energyText, background: colors.energyTint, dot: colors.energy };
}

export function formatListPrice(chargePoint: ChargePoint) {
  const { pricing } = chargePoint;
  if (!pricing) return 'Sem tarifa';
  if (chargePoint.type === 'COMMERCIAL' && pricing.baseRateCents !== null) {
    return `R$ ${formatAmount(pricing.baseRateCents)} × ${formatAmount(pricing.demandFactor * 100)}/kWh`;
  }
  return formatPricePerKwh(pricing.pricePerKwhCents);
}

function Photo({ chargePoint }: { chargePoint: ChargePoint }) {
  const [failed, setFailed] = useState(false);
  if (!chargePoint.photoUrl || failed) {
    return (
      <View style={[styles.photo, styles.photoFallback]}>
        <RingMark size={44} testID="ring-mark" />
      </View>
    );
  }
  return (
    <Image
      source={{ uri: chargePoint.photoUrl }}
      contentFit="cover"
      transition={motion.duration.slow}
      onError={() => setFailed(true)}
      accessible={false}
      style={styles.photo}
    />
  );
}

export function ChargePointCard({ chargePoint, distanceMeters, myCharge, onPress }: ChargePointCardProps) {
  const { garage, spot } = splitChargePointName(chargePoint.name);
  const pill = getListStatusPill(chargePoint);
  const isPrivate = chargePoint.type === 'PRIVATE';
  const queue = chargePoint.queueLength > 0 ? `, ${formatQueueLength(chargePoint.queueLength)}` : '';
  const distance = distanceMeters == null ? '' : `, a ${formatDistance(distanceMeters)}`;
  const status = myCharge ? 'Em uso por você' : chargePointStatusLabels[chargePoint.status];
  const chips: { label: string; testID?: string }[] = [
    { label: formatPower(chargePoint.maxPowerKw) },
    { label: formatListPrice(chargePoint) },
    ...(distanceMeters == null ? [] : [{ label: formatDistance(distanceMeters), testID: 'distance-tag' }]),
    ...(isPrivate ? [] : [{ label: 'cartão' }]),
    ...(chargePoint.queueLength > 0
      ? [{ label: formatQueueLength(chargePoint.queueLength), testID: 'queue-length-tag' }]
      : []),
  ];
  const myChargeLine = myCharge
    ? [
        formatPower(chargePoint.maxPowerKw),
        myCharge.limitSocPercent === null ? null : `limite ${myCharge.limitSocPercent}%`,
        myCharge.readyAt ? `pronta às ${myCharge.readyAt}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${chargePoint.name}, ${status}${queue}${distance}`}
      onPress={onPress}
      scaleTo={0.98}
      style={styles.card}
    >
      <Photo chargePoint={chargePoint} />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.titles}>
            <Text numberOfLines={1} style={styles.title}>
              {chargePoint.code} · {spot}
            </Text>
            <Text numberOfLines={1} style={styles.subtitle}>
              {garage ?? chargePoint.organizationName}
            </Text>
          </View>
          {myCharge ? (
            myCharge.socPercent === null ? null : (
              <View style={styles.soc}>
                <Text style={styles.socValue}>{Math.round(myCharge.socPercent)}</Text>
                <Text style={styles.socUnit}>%</Text>
              </View>
            )
          ) : (
            <View testID="list-status-pill" style={[styles.pill, { backgroundColor: pill.background }]}>
              <View style={[styles.dot, { backgroundColor: pill.dot }]} />
              <Text style={[styles.pillLabel, { color: pill.color }]}>{pill.label}</Text>
            </View>
          )}
        </View>
        {myCharge ? (
          <>
            <View style={[styles.pill, styles.pillStart, { backgroundColor: colors.energyTint }]}>
              <StatusDot color={colors.energy} size={7} live />
              <Text style={[styles.pillLabel, { color: colors.energyText }]}>Em uso por você</Text>
            </View>
            <View style={styles.footer}>
              {myCharge.socPercent === null ? null : (
                <ProgressMeter value={myCharge.socPercent} limit={myCharge.limitSocPercent ?? undefined} flow />
              )}
              <Text style={styles.footerText}>{myChargeLine}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.chips}>
              {chips.map((chip) => (
                <Text
                  key={chip.label}
                  testID={chip.testID}
                  style={[styles.chip, chip.testID === 'queue-length-tag' && styles.queueChip]}
                >
                  {chip.label}
                </Text>
              ))}
            </View>
            <View style={styles.regime}>
              <Icon
                icon={isPrivate ? ShieldCheck : Building2}
                size={14}
                color={isPrivate ? colors.textMuted : colors.infoText}
              />
              <Text style={[styles.regimeText, !isPrivate && { color: colors.infoText }]}>
                {isPrivate ? 'Grupo A · rateio no condomínio' : 'Grupo B · ponto comercial'}
              </Text>
            </View>
          </>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: spacing.md,
    borderRadius: radii.xxl - 4,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceCard,
  },
  photo: {
    width: 104,
    height: 120,
    borderRadius: radii.lg - 4,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceRaised,
  },
  photoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
    paddingTop: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titles: {
    flexShrink: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  pillStart: {
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pillLabel: {
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  soc: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  socValue: {
    fontSize: 24,
    lineHeight: 26,
    fontFamily: fonts.bold,
    letterSpacing: -1,
    color: colors.energyText,
  },
  socUnit: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.energyText,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceInset,
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textTitle,
  },
  queueChip: {
    backgroundColor: colors.warningTint,
    color: colors.warningText,
  },
  regime: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  regimeText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  footer: {
    marginTop: 'auto',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
});
