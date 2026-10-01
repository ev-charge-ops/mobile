import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { fonts, motion, palette, radii } from '@/constants/theme';
import type { MyMonthlyStatement } from '@/features/charging/api/statement-api';
import { formatCents } from '@/features/charging/charging-format';
import { formatClosingDate, getDailyBars, type DailyBar } from '@/features/charging/history-month';
import { formatEnergy } from '@/utils/format-energy';

const BAR_STAGGER_MS = 30;
const MIN_BAR_RATIO = 0.08;
const amountFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export type MonthlyStatementCardProps = {
  statement: MyMonthlyStatement;
};

export function MonthlyStatementCard({ statement }: MonthlyStatementCardProps) {
  const bars = getDailyBars(statement.dailyEnergy, statement.month);
  const energyLabel =
    statement.utilityRateCents === null
      ? `Energia · ${formatEnergy(statement.energyKwh)}`
      : `Energia · ${formatEnergy(statement.energyKwh)} × ${formatCents(statement.utilityRateCents)}`;

  return (
    <View style={styles.card} testID="monthly-statement-card">
      <View style={styles.head}>
        <View style={styles.titles}>
          <Text style={styles.caption}>Seu rateio · unidade {statement.unitLabel}</Text>
          <View accessible accessibilityLabel={`Total ${formatCents(statement.totalCents)}`} style={styles.total}>
            <Text style={styles.currency}>R$</Text>
            <Text style={styles.amount}>{amountFormatter.format(statement.totalCents / 100)}</Text>
          </View>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipLabel}>
            {statement.status === 'CLOSED' ? 'Fechado' : `Fecha ${formatClosingDate(statement.closesAt)}`}
          </Text>
        </View>
      </View>
      <View style={styles.bars} accessibilityLabel="Energia por dia" testID="statement-bars">
        {bars.map((bar, index) => (
          <StatementBar key={bar.day} bar={bar} index={index} />
        ))}
      </View>
      <View style={styles.lines}>
        <StatementLine label={energyLabel} value={formatCents(statement.energyCents)} />
        <StatementLine label="Taxa de acesso mensal" value={formatCents(statement.accessFeeCents)} />
        <StatementLine label="Ocupação após tolerância" value={formatCents(statement.idleFeeCents)} />
      </View>
    </View>
  );
}

function StatementBar({ bar, index }: { bar: DailyBar; index: number }) {
  const growth = useSharedValue(0);

  useEffect(() => {
    growth.set(
      withDelay(
        index * BAR_STAGGER_MS,
        withTiming(1, { duration: motion.duration.rise, easing: motion.easing.out, reduceMotion: ReduceMotion.System }),
      ),
    );
  }, [growth, index]);

  const growStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: growth.get() }] }));
  const active = bar.energyKwh > 0;

  return (
    <Animated.View
      testID={active ? 'statement-bar-active' : 'statement-bar'}
      style={[
        styles.bar,
        {
          height: `${Math.max(MIN_BAR_RATIO, bar.ratio) * 100}%`,
          backgroundColor: active ? palette.green500 : palette.night700,
        },
        growStyle,
      ]}
    />
  );
}

function StatementLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.ink,
    borderRadius: radii.cardLarge,
    borderCurve: 'continuous',
    padding: 20,
    gap: 14,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titles: {
    flex: 1,
    gap: 4,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.semibold,
    color: palette.night300,
  },
  total: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  currency: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: palette.night300,
  },
  amount: {
    fontSize: 44,
    lineHeight: 46,
    fontFamily: fonts.bold,
    letterSpacing: -1.8,
    fontVariant: ['tabular-nums'],
    color: palette.white,
  },
  chip: {
    borderRadius: radii.pill,
    backgroundColor: palette.night800,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: palette.night100,
  },
  bars: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    flex: 1,
    borderRadius: 3,
    transformOrigin: 'bottom',
  },
  lines: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: palette.night700,
    paddingTop: 12,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  lineLabel: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: palette.night300,
  },
  lineValue: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
    color: palette.white,
  },
});
