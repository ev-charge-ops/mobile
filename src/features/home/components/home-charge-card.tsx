import { router } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { MetricTile } from '@/components/ui/metric-tile';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ProgressMeter } from '@/components/ui/progress-meter';
import { RingMark } from '@/components/ui/ring-mark';
import { colors, fonts, palette, radii } from '@/constants/theme';
import type { HomeCharge } from '@/features/home/home-summary';

export type HomeChargeCardProps = {
  charge: HomeCharge;
};

export function HomeChargeCard({ charge }: HomeChargeCardProps) {
  const percentLabel = charge.percent === null ? '—' : String(charge.percent);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${charge.title}, ${charge.percent === null ? '' : `${charge.percent}%, `}abrir recarga`}
      scaleTo={0.98}
      onPress={() => router.push({ pathname: '/sessions/[sessionId]', params: { sessionId: charge.sessionId } })}
      style={styles.card}
      testID="home-charge-card"
    >
      <View style={styles.head}>
        <View style={styles.titles}>
          <Text style={styles.title}>{charge.title}</Text>
          {charge.subtitle ? <Text style={styles.subtitle}>{charge.subtitle}</Text> : null}
        </View>
        <View style={styles.percent}>
          <Text style={styles.percentValue}>{percentLabel}</Text>
          {charge.percent === null ? null : <Text style={styles.percentUnit}>%</Text>}
        </View>
      </View>
      <ProgressMeter
        value={charge.percent ?? 0}
        limit={charge.limitPercent ?? undefined}
        flow={charge.isCharging}
        tone={charge.status === 'fault' ? 'fault' : charge.status === 'idle' ? 'demand' : 'energy'}
        testID="home-charge-meter"
      />
      <View style={styles.tiles}>
        <MetricTile label="Energia" value={charge.energy} unit="kWh" style={styles.tile} />
        <MetricTile label="Potência" value={charge.power} unit="kW" style={styles.tile} />
        <MetricTile label="Valor" value={charge.amount} unit="R$" style={styles.tile} />
      </View>
    </PressableScale>
  );
}

export function HomeEmptyCharge() {
  return (
    <View style={[styles.card, styles.empty]} testID="home-empty-charge">
      <View style={styles.emptyMark}>
        <RingMark size={40} ringColor={palette.ink500} boltColor={palette.ink500} nodeColor={null} />
      </View>
      <View style={styles.emptyTexts}>
        <Text style={styles.title}>Nenhuma recarga ativa</Text>
        <Text style={styles.emptyHint}>Escolha um ponto livre do condomínio para começar.</Text>
      </View>
      <Button
        label="Encontrar um ponto"
        icon={MapPin}
        size="lg"
        block
        haptic
        onPress={() => router.navigate('/points')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
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
    gap: 2,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  percent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  percentValue: {
    fontSize: 40,
    lineHeight: 42,
    fontFamily: fonts.bold,
    letterSpacing: -1.8,
    fontVariant: ['tabular-nums'],
    color: colors.energyText,
  },
  percentUnit: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.energyText,
  },
  tiles: {
    flexDirection: 'row',
    gap: 8,
  },
  tile: {
    flex: 1,
    minWidth: 0,
    borderRadius: 16,
  },
  empty: {
    alignItems: 'stretch',
  },
  emptyMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.surfaceInset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTexts: {
    gap: 2,
  },
  emptyHint: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});
