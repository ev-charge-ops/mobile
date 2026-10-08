import { Share2 } from 'lucide-react-native';
import { Fragment, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Rise } from '@/components/ui/rise';
import { colors, fonts, motion, radii, spacing } from '@/constants/theme';
import type { ChargingSessionDetail, SessionPayment } from '@/features/charging/api/charging-api';
import {
  formatAmount,
  formatCents,
  formatDate,
  formatDemandFactor,
  formatDemandSource,
  formatPowerValue,
  formatPricePerKwh,
  formatSessionCode,
  formatTime,
  paymentStatusLabels,
  splitChargePointName,
} from '@/features/charging/charging-format';
import { getChargingSeconds } from '@/features/charging/session-timing';
import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { formatEnergy } from '@/utils/format-energy';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const BADGE_SIZE = 64;
const RING_LENGTH = 2 * Math.PI * 30;
const CHECK_LENGTH = 36;
export const CHECK_DURATION = 600;
const SPARK_HEIGHT = 56;

function ReceiptCheck({ warning }: { warning: boolean }) {
  const reduceMotion = useReduceMotion();
  const disc = useSharedValue(reduceMotion ? 1 : 0);
  const ring = useSharedValue(reduceMotion ? 1 : 0);
  const check = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    disc.set(withTiming(1, { duration: motion.duration.slow, easing: motion.easing.out }));
    ring.set(withTiming(1, { duration: CHECK_DURATION, easing: motion.easing.plug }));
    check.set(withDelay(CHECK_DURATION * 0.5, withTiming(1, { duration: CHECK_DURATION, easing: motion.easing.plug })));
  }, [reduceMotion, disc, ring, check]);

  const discStyle = useAnimatedStyle(() => ({ opacity: disc.get(), transform: [{ scale: 0.6 + disc.get() * 0.4 }] }));
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: RING_LENGTH * (1 - ring.get()) }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LENGTH * (1 - check.get()) }));
  const tint = warning ? colors.warningTint : colors.energyTint;
  const stroke = warning ? colors.warning : colors.energy;
  const ink = warning ? colors.warningText : colors.energyText;

  return (
    <Animated.View
      testID="receipt-badge"
      accessible
      accessibilityRole="image"
      accessibilityLabel={warning ? 'Recarga interrompida' : 'Recarga encerrada com sucesso'}
      style={[styles.badge, discStyle]}
    >
      <Svg width={BADGE_SIZE} height={BADGE_SIZE} viewBox="0 0 72 72">
        <Circle cx={36} cy={36} r={36} fill={tint} />
        <AnimatedCircle
          cx={36}
          cy={36}
          r={30}
          fill="none"
          stroke={stroke}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${RING_LENGTH}`}
          animatedProps={ringProps}
          transform="rotate(-90 36 36)"
        />
        <AnimatedPath
          d={warning ? 'M36 22 L36 40 M36 49 L36 50' : 'M24 37 L32 45 L48 28'}
          fill="none"
          stroke={ink}
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${CHECK_LENGTH}`}
          animatedProps={checkProps}
        />
      </Svg>
    </Animated.View>
  );
}

export function getPowerSpark(session: ChargingSessionDetail, width: number) {
  const readings = session.readings;
  if (readings.length < 2 || width <= 0) return null;
  const times = readings.map((reading) => Date.parse(reading.at));
  const start = times[0];
  const span = Math.max(1, times[times.length - 1] - start);
  const peak = Math.max(...readings.map((reading) => reading.powerKw));
  if (peak <= 0) return null;
  const points = readings
    .map((reading, index) => {
      const x = ((times[index] - start) / span) * width;
      const y = SPARK_HEIGHT - (reading.powerKw / peak) * (SPARK_HEIGHT * 0.8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return { points, peak, peakY: SPARK_HEIGHT * 0.2 };
}

function PowerSpark({ session, averageKw }: { session: ChargingSessionDetail; averageKw: number }) {
  const [width, setWidth] = useState(0);
  const spark = getPowerSpark(session, width);
  const first = session.readings[0];
  const last = session.readings[session.readings.length - 1];

  if (session.readings.length < 2) return null;

  return (
    <View style={styles.spark} testID="receipt-power-spark">
      <View style={styles.sparkLabels}>
        <Text style={styles.cellLabel}>Potência ao longo da sessão</Text>
        {spark ? <Text style={styles.cellLabel}>{`pico ${formatPowerValue(spark.peak)} kW`}</Text> : null}
      </View>
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Potência entre ${formatTime(toSimulatedTime(session, first.at))} e ${formatTime(toSimulatedTime(session, last.at))}`}
        style={styles.sparkCanvas}
      >
        {spark ? (
          <Svg width={width} height={SPARK_HEIGHT}>
            <Line x1={0} y1={spark.peakY} x2={width} y2={spark.peakY} stroke={colors.borderSubtle} strokeDasharray="3 4" />
            <Line x1={0} y1={SPARK_HEIGHT} x2={width} y2={SPARK_HEIGHT} stroke={colors.hairline} />
            <Polyline
              points={spark.points}
              fill="none"
              stroke={colors.energy}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : null}
      </View>
      <View style={styles.sparkLabels}>
        <Text style={styles.cellLabel}>{formatTime(toSimulatedTime(session, first.at))}</Text>
        <Text style={styles.cellLabel}>{`média ${formatPowerValue(averageKw)} kW`}</Text>
        <Text style={styles.cellLabel}>{formatTime(toSimulatedTime(session, last.at))}</Text>
      </View>
    </View>
  );
}

type Row = { label: string; hint?: string; value: string };

function formatSessionDay(iso: string, now: number) {
  const day = new Date(iso).toDateString() === new Date(now).toDateString() ? 'hoje' : formatDate(iso);
  return `${day}, ${formatTime(iso)}`;
}

export function formatShortDuration(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours === 0) return `${minutes} min`;
  return `${hours}h${String(minutes % 60).padStart(2, '0')}`;
}

export function toSimulatedTime(session: ChargingSessionDetail, iso: string) {
  const start = Date.parse(session.startedAt);
  const elapsed = Math.max(0, Date.parse(iso) - start) * Math.max(1, session.simulationSpeed);
  return new Date(start + elapsed).toISOString();
}

export function getReceiptTiming(session: ChargingSessionDetail) {
  const realEnd = session.endedAt ?? session.chargingEndedAt ?? session.startedAt;
  const chargingSeconds = getChargingSeconds(session, Date.parse(realEnd));
  const averageKw = chargingSeconds > 0 ? session.energyKwh / (chargingSeconds / 3600) : 0;
  const endedAt = toSimulatedTime(session, realEnd);
  const totalSeconds = (Date.parse(endedAt) - Date.parse(session.startedAt)) / 1000;
  return { endedAt, averageKw, totalSeconds };
}

export function getRefundedCents(payment: SessionPayment) {
  if (payment.status !== 'REFUNDED') return null;
  return payment.refundedCents ?? payment.capturedCents ?? 0;
}

export function getReceiptRows(session: ChargingSessionDetail): Row[] {
  const isPrivate = session.regime === 'PRIVATE';
  const rows: Row[] = [
    {
      label: 'Energia',
      hint: `${formatEnergy(session.energyKwh)} × ${formatPricePerKwh(session.lockedRateCents)}`,
      value: formatCents(session.energyCostCents),
    },
    {
      label: 'Ocupação',
      hint:
        session.idleFeeCents > 0
          ? `${session.idleMinutes} min × ${formatCents(session.idleFeeCentsPerMinute)}${
              session.idleFeeCents >= session.idleFeeCapCents ? ' · teto atingido' : ''
            }`
          : 'Retirado dentro da tolerância',
      value: formatCents(session.idleFeeCents),
    },
  ];
  if (session.payment) {
    const captured = session.payment.capturedCents;
    const refunded = getRefundedCents(session.payment);
    rows.push({
      label: captured === null ? 'Cartão' : 'Cobrado no cartão',
      hint:
        session.payment.status === 'CAPTURED' || refunded !== null
          ? `Pré-autorização de ${formatCents(session.payment.authorizedCents)} · o restante volta ao limite do cartão`
          : session.payment.status === 'CANCELED'
            ? 'A pré-autorização foi liberada sem cobrança'
            : `Pré-autorização de ${formatCents(session.payment.authorizedCents)}`,
      value: captured === null ? paymentStatusLabels[session.payment.status] : formatCents(captured),
    });
    if (refunded !== null) {
      rows.push({
        label: paymentStatusLabels.REFUNDED,
        hint: session.payment.refundedAt
          ? `Devolvido ao cartão em ${formatDate(session.payment.refundedAt)} às ${formatTime(session.payment.refundedAt)}`
          : 'Devolvido ao cartão',
        value: `−${formatCents(refunded)}`,
      });
    }
  } else {
    rows.push({
      label: 'Forma',
      value: isPrivate
        ? `Rateio mensal da unidade ${session.unitLabel ?? ''}`.trim()
        : 'Cobrança no cartão',
    });
  }
  return rows;
}

export type SessionReceiptProps = {
  session: ChargingSessionDetail;
  now: number;
  onShare: () => void;
  isSharing?: boolean;
  onDone: () => void;
};

export function SessionReceipt({ session, now, onShare, isSharing = false, onDone }: SessionReceiptProps) {
  const insets = useSafeAreaInsets();
  const isInterrupted = session.status === 'INTERRUPTED';
  const { endedAt, averageKw, totalSeconds } = getReceiptTiming(session);
  const { spot } = splitChargePointName(session.chargePoint.name);
  const rows = getReceiptRows(session);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.md }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <ReceiptCheck warning={isInterrupted} />
          <Rise index={1} style={styles.heroTexts}>
            <Text accessibilityRole="header" style={styles.title}>
              {isInterrupted ? 'Recarga interrompida' : 'Recarga encerrada'}
            </Text>
            <Text style={styles.subtitle}>
              {`${session.chargePoint.code} · ${spot} · ${formatSessionDay(endedAt, now)}`}
            </Text>
          </Rise>
          <Rise index={2} style={styles.totalRow}>
            <Text style={styles.totalCurrency}>R$</Text>
            <Text accessibilityLabel={`Total ${formatCents(session.totalCents)}`} style={styles.total}>
              {formatAmount(session.totalCents)}
            </Text>
          </Rise>
        </View>

        <Rise index={3} style={styles.card}>
          {rows.map((row, index) => (
            <Fragment key={row.label}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.row}>
                <View style={styles.rowTexts}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  {row.hint ? <Text style={styles.rowHint}>{row.hint}</Text> : null}
                </View>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
            </Fragment>
          ))}
        </Rise>

        <Rise index={4} style={[styles.card, styles.detailsCard]}>
          <View style={styles.grid}>
            <Cell label="Início" value={formatTime(session.startedAt)} />
            <Cell label="Fim" value={formatTime(endedAt)} />
            <Cell label="Tempo" value={formatShortDuration(totalSeconds)} />
            <Cell label="Potência média" value={formatPowerValue(averageKw)} unit="kW" />
            <Cell
              label={`Tarifa travada às ${formatTime(session.startedAt)}`}
              value={formatAmount(session.lockedRateCents)}
              prefix="R$"
              unit="/kWh"
              wide
            />
            <Cell
              label={`Fator · ${formatDemandSource(session.demandFactorSource, session.demandModelVersion)}`}
              value={formatDemandFactor(session.demandFactor)}
              wide
            />
            <Cell label="Código" value={formatSessionCode(session.id)} />
          </View>
          <PowerSpark session={session} averageKw={averageKw} />
        </Rise>
        {isInterrupted ? (
          <Text style={styles.note}>
            A recarga foi interrompida antes do fim. A cobrança considera apenas a energia medida até a desconexão.
          </Text>
        ) : null}
      </ScrollView>
      <Rise index={5} style={styles.footer}>
        <IconButton
          icon={Share2}
          accessibilityLabel="Compartilhar recibo"
          tone="surface"
          size={56}
          loading={isSharing}
          onPress={onShare}
        />
        <Button label="Voltar ao início" size="lg" block haptic onPress={onDone} style={styles.done} />
      </Rise>
    </View>
  );
}

type CellProps = { label: string; value: string; unit?: string; prefix?: string; wide?: boolean };

function Cell({ label, value, unit, prefix, wide = false }: CellProps) {
  return (
    <View style={[styles.cell, wide && styles.cellWide]}>
      <Text style={styles.cellLabel}>{label}</Text>
      <View style={styles.cellValueRow}>
        {prefix ? <Text style={styles.cellUnit}>{prefix}</Text> : null}
        <Text style={styles.cellValue}>{value}</Text>
        {unit ? <Text style={styles.cellUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
  },
  heroTexts: {
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: fonts.bold,
    letterSpacing: -0.5,
    color: colors.textTitle,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  totalCurrency: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  total: {
    fontSize: 56,
    lineHeight: 60,
    fontFamily: fonts.bold,
    letterSpacing: -2.8,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  card: {
    paddingHorizontal: 18,
    paddingVertical: spacing.xs,
    borderRadius: radii.xxl - 4,
    backgroundColor: colors.surfaceCard,
  },
  detailsCard: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowTexts: {
    flexShrink: 1,
    gap: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  rowHint: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
    textAlign: 'right',
    flexShrink: 0,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
  },
  cell: {
    width: '33.33%',
    gap: 2,
    paddingRight: spacing.sm,
  },
  cellWide: {
    width: '66.66%',
  },
  cellLabel: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  cellValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  cellValue: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  cellUnit: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  spark: {
    gap: 6,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  sparkLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sparkCanvas: {
    height: SPARK_HEIGHT,
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  done: {
    flex: 1,
  },
});
