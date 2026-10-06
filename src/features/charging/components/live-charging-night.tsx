import {
  Bell,
  BellRing,
  ChevronLeft,
  Info,
  SlidersHorizontal,
  TriangleAlert,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Rise } from '@/components/ui/rise';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { fonts, nightColors, palette, radii, spacing } from '@/constants/theme';
import type { ChargingSessionDetail } from '@/features/charging/api/charging-api';
import { useChargePoint } from '@/features/charging/api/use-charge-points';
import { formatQueueLength } from '@/features/charging/charge-point-queue';
import {
  formatAmount,
  formatCents,
  formatDemandFactor,
  formatLimit,
  formatPowerValue,
  formatPricePerKwh,
  formatTime,
  splitChargePointName,
} from '@/features/charging/charging-format';
import { CarTopTile } from '@/features/charging/components/car-top-tile';
import { ChargeRing } from '@/features/charging/components/charge-ring';
import {
  estimateLimitSocPercent,
  getChargingProgress,
  getGraceProgress,
  getRemainingEnergyKwh,
  getRemainingRealSeconds,
} from '@/features/charging/session-progress';
import { planSessionReminders } from '@/features/charging/session-reminders';
import {
  estimateIdleFeeCents,
  formatClock,
  formatDuration,
  getChargingSeconds,
  getGraceRemainingSeconds,
  getIdleSeconds,
} from '@/features/charging/session-timing';
import { useTweenedNumber } from '@/features/charging/use-tweened-number';
import { formatEnergy } from '@/utils/format-energy';

export const STATE_CROSSFADE_DURATION = 400;

const GRACE_RING_SIZE = 280;
const GRACE_RING_RADIUS = 120;

type NightSession = ChargingSessionDetail;

export function formatElapsedTile(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours === 0) return { value: String(minutes), unit: 'min' };
  return { value: `${hours}h ${String(minutes % 60).padStart(2, '0')}`, unit: 'min' };
}

function formatLimitTarget(session: NightSession) {
  const { limit } = session;
  if (limit.type === 'PERCENT' && limit.socPercent !== null) return `limite de ${limit.socPercent}%`;
  if (limit.type === 'ENERGY' && limit.energyKwh !== null) {
    return `limite de ${formatEnergy(limit.energyKwh, { fractionDigits: 1 })}`;
  }
  if (limit.type === 'AMOUNT' && limit.amountCents !== null) return `limite de ${formatCents(limit.amountCents)}`;
  return 'carga completa';
}

export function describeChargingForecast(session: NightSession, now: number) {
  const soc = session.socPercent === null ? null : `${Math.round(session.socPercent)}%`;
  const remaining = getRemainingRealSeconds(session.projectedChargingEndsAt, now);
  const target = formatLimitTarget(session);
  const forecast = remaining === null ? target : `${target} em cerca de ${formatDuration(Math.max(60, remaining))}`;
  return soc ? `${soc} · ${forecast}` : forecast.charAt(0).toUpperCase() + forecast.slice(1);
}

export function describeLockedRate(session: NightSession) {
  const rate = `Tarifa travada às ${formatTime(session.startedAt)} · ${formatPricePerKwh(session.lockedRateCents)}`;
  return session.regime === 'PRIVATE'
    ? `${rate}, repassada a custo`
    : `${rate} com fator ${formatDemandFactor(session.demandFactor)}`;
}

function RoundAction({ icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      haptic="selection"
      scaleTo={0.92}
      style={styles.roundAction}
    >
      <Icon icon={icon} size={22} color={nightColors.textTitle} />
    </PressableScale>
  );
}

function WhitePill({
  label,
  onPress,
  loading,
  grow,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  grow?: boolean;
}) {
  return (
    <Button
      label={label}
      scheme="night"
      size="xl"
      block
      haptic="impactMedium"
      loading={loading}
      onPress={onPress}
      style={grow ? styles.flex : undefined}
    />
  );
}

function Tile({ label, value, unit, unitBefore, accent }: TileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <View style={styles.tileValueRow}>
        {unitBefore ? <Text style={styles.tileUnit}>{unitBefore}</Text> : null}
        <Text style={styles.tileValue}>{value}</Text>
        {unit ? <Text style={[styles.tileUnit, accent && { color: palette.green500 }]}>{unit}</Text> : null}
      </View>
    </View>
  );
}

type TileProps = { label: string; value: string; unit?: string; unitBefore?: string; accent?: boolean };

type HeaderProps = {
  session: NightSession;
  subtitle: string;
  trailing: ReactNode;
  onBack: () => void;
};

function NightHeader({ session, subtitle, trailing, onBack }: HeaderProps) {
  const { spot } = splitChargePointName(session.chargePoint.name);

  return (
    <Rise style={styles.header}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={onBack}
        scaleTo={0.92}
        style={styles.back}
      >
        <Icon icon={ChevronLeft} size={20} color={nightColors.textTitle} />
      </PressableScale>
      <View style={styles.headerTitles}>
        <Text accessibilityRole="header" numberOfLines={1} style={styles.headerTitle}>
          {session.chargePoint.code} · {spot}
        </Text>
        <Text numberOfLines={1} style={styles.headerSubtitle}>
          {subtitle}
        </Text>
      </View>
      {trailing}
    </Rise>
  );
}

function garageOf(session: NightSession) {
  return splitChargePointName(session.chargePoint.name).garage ?? session.chargePoint.name;
}

export type LiveChargingNightProps = {
  session: NightSession;
  now: number;
  readAt: number;
  justPlugged: boolean;
  isStopping: boolean;
  onBack: () => void;
  onStop: () => void;
};

export function LiveChargingNight(props: LiveChargingNightProps) {
  const insets = useSafeAreaInsets();
  const { session } = props;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md }]}>
      <Animated.View
        key={session.status}
        entering={FadeIn.duration(STATE_CROSSFADE_DURATION)}
        exiting={FadeOut.duration(STATE_CROSSFADE_DURATION)}
        style={styles.flex}
      >
        {session.status === 'GRACE' ? (
          <GraceView {...props} />
        ) : session.status === 'IDLE' ? (
          <IdleView {...props} />
        ) : (
          <ActiveView {...props} />
        )}
      </Animated.View>
    </View>
  );
}

function ActiveView({ session, now, readAt, justPlugged, isStopping, onBack, onStop }: LiveChargingNightProps) {
  const [sheet, setSheet] = useState<'limit' | 'reminders' | null>(null);
  const energy = useTweenedNumber(session.energyKwh);
  const elapsed = formatElapsedTile(getChargingSeconds(session, now));
  const readSeconds = Math.max(0, Math.floor((now - readAt) / 1000));
  const progress = session.socPercent === null ? getChargingProgress(session) : session.socPercent / 100;
  const limitSoc = estimateLimitSocPercent(session);
  const isThrottled = session.powerKw < session.allocatedPowerKw;

  return (
    <>
      <NightHeader
        session={session}
        onBack={onBack}
        subtitle={`${garageOf(session)} · início ${formatTime(session.startedAt)}`}
        trailing={
          <View style={styles.reading}>
            <Text style={styles.readingTitle}>Carregando</Text>
            <Text style={styles.readingHint}>{`leitura há ${readSeconds} s`}</Text>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.ringArea}>
          <ChargeRing
            progress={progress}
            glow
            limit={limitSoc === null ? null : limitSoc / 100}
            limitLabel={limitSoc === null ? null : `limite ${limitSoc}%`}
            accessibilityLabel={
              session.socPercent === null
                ? 'Progresso da recarga'
                : `${Math.round(session.socPercent)}% de carga${limitSoc === null ? '' : `, limite em ${limitSoc}%`}`
            }
            testID="charge-ring"
          >
            <CarTopTile plugged animatePlug={justPlugged} />
          </ChargeRing>
        </View>
        <Rise index={1} style={styles.hero}>
          <View style={styles.heroRow}>
            <Text testID="live-energy" style={styles.heroValue}>
              {formatEnergy(energy, { withUnit: false })}
            </Text>
            <Text style={styles.heroUnit}>kWh</Text>
          </View>
          <Text style={styles.heroHint}>{describeChargingForecast(session, now)}</Text>
        </Rise>
        <Rise index={2} style={styles.tiles}>
          <Tile label="Potência" value={formatPowerValue(session.powerKw)} unit="kW" />
          <Tile label="Tempo" value={elapsed.value} unit={elapsed.unit} />
          <Tile label="Valor" value={formatAmount(session.energyCostCents)} unitBefore="R$" />
        </Rise>
        <Rise index={3}>
          {isThrottled ? (
            <Text style={[styles.footnote, styles.warningNote]}>
              Potência reduzida pelo balanceamento do prédio. O preço por kWh não muda.
            </Text>
          ) : null}
          <Text style={styles.footnote}>{describeLockedRate(session)}</Text>
          {session.simulationSpeed > 1 ? (
            <Text style={styles.footnote}>{`Simulação acelerada · ${session.simulationSpeed}×`}</Text>
          ) : null}
        </Rise>
      </ScrollView>
      <Rise index={4} style={styles.footer}>
        <RoundAction icon={SlidersHorizontal} label="Ajustar limite" onPress={() => setSheet('limit')} />
        <RoundAction icon={Bell} label="Lembrete" onPress={() => setSheet('reminders')} />
        <WhitePill label="Encerrar recarga" loading={isStopping} onPress={onStop} grow />
      </Rise>
      <LimitSheet session={session} visible={sheet === 'limit'} onClose={() => setSheet(null)} />
      <RemindersSheet session={session} now={now} visible={sheet === 'reminders'} onClose={() => setSheet(null)} />
    </>
  );
}

function StatusChip({ label, color, background }: { label: string; color: string; background: string }) {
  return (
    <View style={[styles.statusChip, { backgroundColor: background }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusChipLabel, { color }]}>{label}</Text>
    </View>
  );
}

function GraceView({ session, now, isStopping, onBack, onStop }: LiveChargingNightProps) {
  const toast = useToast();
  const graceEnd = session.graceEndsAt ? formatTime(session.graceEndsAt) : null;
  const reminder = planSessionReminders(session).find((item) => item.identifier.endsWith('grace'));

  const notify = () => {
    if (reminder && Date.parse(reminder.fireAt) > Date.now()) {
      toast.show(`Lembrete agendado para ${formatTime(reminder.fireAt)}.`, { tone: 'info' });
      return;
    }
    toast.show('A tolerância está no fim. Retire o veículo para evitar a multa.', { tone: 'info' });
  };

  return (
    <>
      <NightHeader
        session={session}
        onBack={onBack}
        subtitle={`${garageOf(session)} · início ${formatTime(session.startedAt)}`}
        trailing={<StatusChip label="Tolerância" color={palette.amber500} background="rgba(242,169,59,0.14)" />}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.graceRing}>
          <ChargeRing
            progress={getGraceProgress(session, now)}
            size={GRACE_RING_SIZE}
            radius={GRACE_RING_RADIUS}
            strokeWidth={12}
            color={palette.amber500}
            trackColor={nightColors.surfaceInset}
            accessibilityLabel="Tempo de tolerância restante"
          >
            <View style={styles.graceCenter}>
              <Text style={styles.eyebrow}>Sem multa por</Text>
              <Text accessibilityLiveRegion="polite" style={styles.clock}>
                {formatClock(getGraceRemainingSeconds(session, now))}
              </Text>
              {graceEnd ? <Text style={styles.graceUntil}>{`até ${graceEnd}`}</Text> : null}
            </View>
          </ChargeRing>
        </View>
        <Rise index={1} style={styles.statement}>
          <Text style={styles.statementTitle}>Recarga concluída</Text>
          <Text style={styles.statementBody}>
            {graceEnd
              ? `Retire o veículo até ${graceEnd} para liberar a vaga sem multa.`
              : 'Retire o veículo para liberar a vaga sem multa.'}
          </Text>
        </Rise>
        <Rise index={2} style={styles.tiles}>
          <Tile label="Energia" value={formatEnergy(session.energyKwh, { withUnit: false })} unit="kWh" accent />
          <Tile label="Valor" value={formatAmount(session.energyCostCents)} unitBefore="R$" />
        </Rise>
        <Rise index={3}>
          <Text style={styles.footnote}>
            {`${graceEnd ? `Depois das ${graceEnd}` : 'Depois da tolerância'}: ${formatCents(session.idleFeeCentsPerMinute)} por minuto, teto de ${formatCents(session.idleFeeCapCents)} por sessão`}
          </Text>
        </Rise>
      </ScrollView>
      <Rise index={4} style={styles.footerColumn}>
        <Button
          label="Avisar quando faltar 2 min"
          icon={BellRing}
          variant="secondary"
          scheme="night"
          size="md"
          block
          onPress={notify}
        />
        <WhitePill label="Retirei o veículo · encerrar" loading={isStopping} onPress={onStop} />
      </Rise>
    </>
  );
}

function IdleView({ session, now, isStopping, onBack, onStop }: LiveChargingNightProps) {
  const { data: chargePoint } = useChargePoint(session.chargePoint.id);
  const feeCents = estimateIdleFeeCents(session, now);
  const leftCents = Math.max(0, session.idleFeeCapCents - feeCents);
  const ratio = session.idleFeeCapCents > 0 ? Math.min(1, feeCents / session.idleFeeCapCents) : 0;
  const idleMinutes = Math.floor(getIdleSeconds(session, now) / 60);
  const chargedAt = session.chargingEndedAt ? formatTime(session.chargingEndedAt) : null;
  const graceEnd = session.graceEndsAt ? formatTime(session.graceEndsAt) : null;
  const queueLength = chargePoint?.queueLength ?? 0;
  const billing =
    session.regime === 'PRIVATE'
      ? `O valor entra no rateio da unidade ${session.unitLabel ?? ''}.`.replace(' .', '.')
      : 'O valor é cobrado no cartão ao encerrar.';

  return (
    <>
      <NightHeader
        session={session}
        onBack={onBack}
        subtitle={chargedAt ? `${garageOf(session)} · carga completa às ${chargedAt}` : garageOf(session)}
        trailing={null}
      />
      <ScrollView contentContainerStyle={[styles.body, styles.idleBody]} showsVerticalScrollIndicator={false}>
        <Rise style={styles.alert}>
          <View style={styles.alertIcon}>
            <Icon icon={TriangleAlert} size={20} color="#FF8A8E" />
          </View>
          <View style={styles.flex}>
            <View style={styles.alertTitleRow}>
              <View style={[styles.statusDot, { backgroundColor: palette.red500 }]} />
              <Text accessibilityRole="header" style={styles.alertTitle}>
                Multa de ocupação em curso
              </Text>
            </View>
            {graceEnd ? <Text style={styles.cardHint}>{`Tolerância encerrada às ${graceEnd}`}</Text> : null}
          </View>
        </Rise>
        <Rise index={1} style={styles.feeCard}>
          <View style={styles.feeRow}>
            <View style={styles.feeColumn}>
              <Text style={styles.cardHint}>Tempo na vaga</Text>
              <View style={styles.tileValueRow}>
                <Text accessibilityLiveRegion="polite" style={styles.feeValue}>
                  {idleMinutes}
                </Text>
                <Text style={styles.feeUnit}>min</Text>
              </View>
            </View>
            <View style={[styles.feeColumn, styles.feeColumnEnd]}>
              <Text style={styles.cardHint}>Multa acumulada</Text>
              <View style={styles.tileValueRow}>
                <Text style={styles.feeUnitSmall}>R$</Text>
                <Text style={[styles.feeValue, styles.feeValueAlert]}>{formatAmount(feeCents)}</Text>
              </View>
            </View>
          </View>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Multa acumulada em relação ao teto de ${formatCents(session.idleFeeCapCents)}`}
            accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
            style={styles.meterTrack}
          >
            <View style={[styles.meterFill, { width: `${ratio * 100}%` }]} />
          </View>
          <View style={styles.meterLabels}>
            <Text style={styles.cardHint}>{`Faltam ${formatCents(leftCents)} até o teto`}</Text>
            <Text style={styles.cardHint}>{`Teto ${formatCents(session.idleFeeCapCents)}`}</Text>
          </View>
        </Rise>
        <Rise index={2} style={styles.infoCard}>
          <Icon icon={Info} size={20} color={nightColors.textMuted} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            <Text style={styles.infoStrong}>Como a multa é calculada. </Text>
            {`${formatCents(session.idleFeeCentsPerMinute)} por minuto após ${session.gracePeriodMinutes} min de tolerância · teto de ${formatCents(session.idleFeeCapCents)} por sessão. ${billing}`}
          </Text>
        </Rise>
        {queueLength > 0 ? (
          <Rise index={3} style={styles.infoCard}>
            <View style={styles.queueIcon}>
              <Icon icon={Users} size={20} color={nightColors.textTitle} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.queueTitle}>{`${formatQueueLength(queueLength)} para este ponto`}</Text>
              <Text style={styles.cardHint}>Ao liberar a vaga, o próximo da fila é avisado.</Text>
            </View>
          </Rise>
        ) : null}
      </ScrollView>
      <Rise index={4} style={styles.footerColumn}>
        <Text style={[styles.footnote, styles.footnoteTight]}>A multa para de contar quando o cabo é desconectado.</Text>
        <WhitePill label="Retirei o veículo · encerrar" loading={isStopping} onPress={onStop} />
      </Rise>
    </>
  );
}

type SheetProps = { session: NightSession; visible: boolean; onClose: () => void };

function LimitSheet({ session, visible, onClose }: SheetProps) {
  const remaining = getRemainingEnergyKwh(session);

  return (
    <Sheet visible={visible} onClose={onClose} scheme="night" closeLabel="Fechar limite">
      <View style={styles.sheetContent}>
        <Text accessibilityRole="header" style={styles.sheetTitle}>
          Limite da recarga
        </Text>
        <View style={styles.sheetRow}>
          <Text style={styles.sheetLabel}>Limite atual</Text>
          <Text style={styles.sheetValue}>{formatLimit(session.limit)}</Text>
        </View>
        {remaining === null ? null : (
          <View style={styles.sheetRow}>
            <Text style={styles.sheetLabel}>Falta entregar</Text>
            <Text style={styles.sheetValue}>{formatEnergy(remaining)}</Text>
          </View>
        )}
        <Text style={styles.sheetBody}>
          O limite é enviado ao carregador quando a recarga começa. Para mudar agora, encerre esta recarga e inicie outra
          com o novo limite — você paga só a energia medida.
        </Text>
        <Button label="Entendi" scheme="night" size="lg" block onPress={onClose} />
      </View>
    </Sheet>
  );
}

const reminderLabels: Record<string, string> = {
  complete: 'Recarga concluída',
  grace: 'Tolerância acabando',
  idle: 'Multa de ocupação',
};

function RemindersSheet({ session, now, visible, onClose }: SheetProps & { now: number }) {
  const reminders = planSessionReminders(session).filter((reminder) => Date.parse(reminder.fireAt) > now);

  return (
    <Sheet visible={visible} onClose={onClose} scheme="night" closeLabel="Fechar lembretes">
      <View style={styles.sheetContent}>
        <Text accessibilityRole="header" style={styles.sheetTitle}>
          Lembretes desta recarga
        </Text>
        {reminders.length === 0 ? (
          <Text style={styles.sheetBody}>Os horários aparecem assim que o carregador prevê o fim da recarga.</Text>
        ) : (
          reminders.map((reminder) => {
            const kind = reminder.identifier.split(':').pop() ?? '';
            return (
              <View key={reminder.identifier} style={styles.sheetRow}>
                <Text style={styles.sheetLabel}>{reminderLabels[kind] ?? reminder.title}</Text>
                <Text style={styles.sheetValue}>{formatTime(reminder.fireAt)}</Text>
              </View>
            );
          })
        )}
        <Text style={styles.sheetBody}>
          Os avisos chegam como notificação no celular, mesmo com o app fechado, se as notificações estiverem
          permitidas.
        </Text>
        <Button label="Fechar" scheme="night" size="lg" block onPress={onClose} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: nightColors.bgBase,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: nightColors.surfaceInset,
  },
  headerTitles: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: nightColors.textTitle,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
  },
  reading: {
    alignItems: 'flex-end',
    gap: 1,
  },
  readingTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: nightColors.textTitle,
  },
  readingHint: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  body: {
    flexGrow: 1,
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  idleBody: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  ringArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 330,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  heroValue: {
    fontSize: 68,
    lineHeight: 72,
    fontFamily: fonts.bold,
    letterSpacing: -3.4,
    color: nightColors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  heroUnit: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: palette.green500,
  },
  heroHint: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
    textAlign: 'center',
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  tile: {
    flex: 1,
    gap: 6,
    padding: 14,
    borderRadius: radii.card,
    backgroundColor: nightColors.surfaceCard,
  },
  tileLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: nightColors.textMuted,
  },
  tileValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  tileValue: {
    fontSize: 22,
    fontFamily: fonts.bold,
    letterSpacing: -0.4,
    color: nightColors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  tileUnit: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: nightColors.textMuted,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  footnoteTight: {
    paddingHorizontal: 0,
  },
  warningNote: {
    color: palette.amber500,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  footerColumn: {
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  roundAction: {
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: nightColors.surfaceInset,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.pill,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusChipLabel: {
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  graceRing: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  graceCenter: {
    alignItems: 'center',
    gap: 6,
  },
  eyebrow: {
    fontSize: 13,
    fontFamily: fonts.bold,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: nightColors.textMuted,
  },
  clock: {
    fontSize: 68,
    lineHeight: 72,
    fontFamily: fonts.bold,
    letterSpacing: -3.4,
    color: nightColors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  graceUntil: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: palette.amber500,
  },
  statement: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  statementTitle: {
    fontSize: 30,
    lineHeight: 33,
    fontFamily: fonts.bold,
    letterSpacing: -0.9,
    color: nightColors.textTitle,
    textAlign: 'center',
  },
  statementBody: {
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
    textAlign: 'center',
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: 'rgba(229,72,77,0.32)',
    backgroundColor: 'rgba(229,72,77,0.14)',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229,72,77,0.2)',
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#FF8A8E',
  },
  cardHint: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: nightColors.textMuted,
  },
  feeCard: {
    gap: 18,
    padding: spacing.xl,
    borderRadius: radii.xxl,
    backgroundColor: nightColors.surfaceCard,
  },
  feeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  feeColumn: {
    flex: 1,
    gap: 6,
  },
  feeColumnEnd: {
    alignItems: 'flex-end',
  },
  feeValue: {
    fontSize: 42,
    lineHeight: 44,
    fontFamily: fonts.bold,
    letterSpacing: -2,
    color: nightColors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  feeValueAlert: {
    color: '#FF8A8E',
  },
  feeUnit: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: nightColors.textMuted,
  },
  feeUnitSmall: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: nightColors.textMuted,
  },
  meterTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: nightColors.surfaceInset,
  },
  meterFill: {
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.red500,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radii.card,
    backgroundColor: nightColors.surfaceCard,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
  },
  infoStrong: {
    fontFamily: fonts.bold,
    color: nightColors.textTitle,
  },
  queueIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.tile,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: nightColors.surfaceInset,
  },
  queueTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: nightColors.textTitle,
  },
  sheetContent: {
    gap: spacing.lg,
  },
  sheetTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fonts.bold,
    letterSpacing: -0.4,
    color: nightColors.textTitle,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  sheetLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: nightColors.textMuted,
  },
  sheetValue: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: nightColors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  sheetBody: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
  },
});
