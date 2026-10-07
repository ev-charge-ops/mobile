import { Fragment, type Ref } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { RingMark } from '@/components/ui/ring-mark';
import { colors, fonts, palette, radii, spacing } from '@/constants/theme';
import type { ChargingSessionDetail } from '@/features/charging/api/charging-api';
import {
  formatAmount,
  formatCents,
  formatDate,
  formatDemandFactor,
  formatDemandSource,
  formatPowerValue,
  formatSessionCode,
  formatTime,
  splitChargePointName,
} from '@/features/charging/charging-format';
import {
  formatShortDuration,
  getReceiptRows,
  getReceiptTiming,
} from '@/features/charging/components/session-receipt';

export const SHARE_CARD_WIDTH = 360;

export function getShareCardRows(session: ChargingSessionDetail) {
  return getReceiptRows(session).map((row) =>
    row.label === 'Forma' && session.regime === 'PRIVATE'
      ? {
          label: 'Rateio da unidade',
          hint: session.unitLabel ? `Unidade ${session.unitLabel} · fatura mensal` : 'Fatura mensal do condomínio',
          value: formatCents(session.totalCents),
        }
      : row,
  );
}

export type ReceiptShareCardProps = {
  session: ChargingSessionDetail;
  ref?: Ref<View>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function ReceiptShareCard({ session, ref, onLayout }: ReceiptShareCardProps) {
  const isInterrupted = session.status === 'INTERRUPTED';
  const { endedAt, averageKw, totalSeconds } = getReceiptTiming(session);
  const { garage, spot } = splitChargePointName(session.chargePoint.name);
  const rows = getShareCardRows(session);

  return (
    <View ref={ref} collapsable={false} onLayout={onLayout} style={styles.canvas} testID="receipt-share-card">
      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <RingMark size={30} testID="ring-mark" />
          <Text style={styles.brandName}>EV ChargeOps</Text>
        </View>
        <View style={[styles.status, isInterrupted && styles.statusWarning]}>
          <View style={[styles.statusDot, isInterrupted && styles.statusDotWarning]} />
          <Text style={[styles.statusText, isInterrupted && styles.statusTextWarning]}>
            {isInterrupted ? 'Interrompida' : 'Concluída'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Recibo de recarga</Text>
          <Text style={styles.point}>{`${session.chargePoint.code} · ${spot}`}</Text>
          {garage ? <Text style={styles.meta}>{garage}</Text> : null}
          <Text style={styles.meta}>{`${formatDate(endedAt)} às ${formatTime(endedAt)}`}</Text>
        </View>

        <View style={styles.totalBlock}>
          <Text style={styles.label}>Total</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalCurrency}>R$</Text>
            <Text style={styles.total}>{formatAmount(session.totalCents)}</Text>
          </View>
        </View>

        <View style={styles.rows}>
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
        </View>

        <View style={styles.details}>
          <Detail label="Início" value={formatTime(session.startedAt)} />
          <Detail label="Fim" value={formatTime(endedAt)} />
          <Detail label="Duração" value={formatShortDuration(totalSeconds)} />
          <Detail label="Potência média" value={`${formatPowerValue(averageKw)} kW`} />
          <Detail
            label="Fator de demanda"
            value={formatDemandFactor(session.demandFactor)}
            hint={formatDemandSource(session.demandFactorSource, session.demandModelVersion)}
            wide
          />
          <Detail label="Sessão" value={formatSessionCode(session.id)} wide mono />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerDot} />
        <Text style={styles.footerText}>evchargeops.com.br</Text>
      </View>
    </View>
  );
}

type DetailProps = { label: string; value: string; hint?: string; wide?: boolean; mono?: boolean };

function Detail({ label, value, hint, wide = false, mono = false }: DetailProps) {
  return (
    <View style={[styles.detail, wide && styles.detailWide]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.detailValue, mono && styles.detailMono]}>{value}</Text>
      {hint ? <Text style={styles.detailHint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: SHARE_CARD_WIDTH,
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    backgroundColor: palette.ink100,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandName: {
    fontSize: 17,
    fontFamily: fonts.extrabold,
    letterSpacing: -0.3,
    color: colors.textTitle,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.energyTint,
  },
  statusWarning: {
    backgroundColor: colors.warningTint,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.energy,
  },
  statusDotWarning: {
    backgroundColor: colors.warning,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.energyText,
  },
  statusTextWarning: {
    color: colors.warningText,
  },
  card: {
    gap: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.cardLarge,
    backgroundColor: colors.surfaceCard,
  },
  header: {
    gap: 3,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: fonts.bold,
    letterSpacing: -0.5,
    color: colors.textTitle,
    marginBottom: spacing.xs,
  },
  point: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  meta: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  totalBlock: {
    gap: 2,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceInset,
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
    fontSize: 52,
    lineHeight: 58,
    fontFamily: fonts.bold,
    letterSpacing: -2.4,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  rows: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
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
    fontSize: 12,
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
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  detail: {
    width: '50%',
    gap: 2,
    paddingRight: spacing.sm,
  },
  detailWide: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  detailMono: {
    fontSize: 14,
    fontFamily: fonts.mono,
  },
  detailHint: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.energyText,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.energy,
  },
  footerText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    letterSpacing: 0.2,
    color: colors.textMuted,
  },
});
