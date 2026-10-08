import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Clock,
  CreditCard,
  LogOut,
  MapPin,
  Navigation,
  Plug,
  RotateCw,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { InfoBanner } from '@/components/ui/info-banner';
import { ListRow } from '@/components/ui/list-row';
import { PressableScale } from '@/components/ui/pressable-scale';
import { RingMark } from '@/components/ui/ring-mark';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, motion, nightColors, palette, radii, shadows, spacing } from '@/constants/theme';
import { ChargingApiError, type ChargePoint, type ChargePointPricing } from '@/features/charging/api/charging-api';
import { useChargePoint, useChargePoints, useLeaveQueue } from '@/features/charging/api/use-charge-points';
import { formatDistance, getDistanceMeters } from '@/features/charging/charge-point-distance';
import {
  formatPosition,
  formatQueueLength,
  getLeaveQueueErrorMessage,
  getQueueState,
  getRemainingSeconds,
  type QueueState,
} from '@/features/charging/charge-point-queue';
import {
  connectorLabels,
  formatCents,
  formatDemandFactor,
  formatPower,
  formatPricePerKwh,
  splitChargePointName,
} from '@/features/charging/charging-format';
import { DemandBadge } from '@/features/charging/components/demand-badge';
import { JoinQueueSheet } from '@/features/charging/components/join-queue-sheet';
import { StartChargingSheet } from '@/features/charging/components/start-charging-sheet';
import { openDirections } from '@/features/charging/directions';
import { useMapCenter } from '@/features/charging/map/use-map-center';
import { formatClock } from '@/features/charging/session-timing';
import { useNightStatusBar } from '@/features/charging/use-night-status-bar';
import { useNow } from '@/hooks/use-now';

const SHEET_MAX_HEIGHT = 672;
const SHEET_TOP_CLEARANCE = 72;
const SHEET_RISE_RATIO = 0.6;
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 800;
const PAN_ACTIVATION = 12;
const PHOTO_HEIGHT = 196;

export type ChargePointScreenProps = {
  chargePointId: string;
};

const unavailableLabels: Record<ChargePoint['status'], string> = {
  AVAILABLE: 'Iniciar recarga',
  CHARGING: 'Ponto em uso',
  IDLE: 'Ponto ocupado',
  OFFLINE: 'Carregador offline',
};

type Availability = { label: string; color: string; dot: string };

const availabilityByStatus: Record<ChargePoint['status'], Availability> = {
  AVAILABLE: { label: 'Disponível agora', color: colors.energyText, dot: colors.energy },
  CHARGING: { label: 'Em uso agora', color: colors.warningText, dot: colors.warning },
  IDLE: { label: 'Ocupado · carga concluída', color: colors.warningText, dot: colors.warning },
  OFFLINE: { label: 'Carregador offline', color: colors.textMuted, dot: colors.textDisabled },
};

export function getAvailability(chargePoint: ChargePoint, queueState: QueueState | null): Availability {
  if (queueState?.kind === 'reserved-for-me') {
    return { label: 'Livre · é a sua vez na fila', color: colors.energyText, dot: colors.energy };
  }
  if (queueState?.kind === 'reserved-for-other') {
    return { label: 'Reservado para a fila', color: colors.warningText, dot: colors.warning };
  }
  return availabilityByStatus[chargePoint.status];
}

function closeDetail() {
  if (router.canGoBack()) router.back();
  else router.replace('/points');
}

const SHEET_CASCADE = 40;

const rise = (index: number) =>
  FadeInDown.duration(motion.duration.reveal)
    .delay(SHEET_CASCADE * index)
    .easing(motion.easing.out);

export function ChargePointScreen({ chargePointId }: ChargePointScreenProps) {
  useNightStatusBar();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { data: chargePoint, isPending, isError, error, refetch, isRefetching } = useChargePoint(chargePointId);
  const [isConfirming, setConfirming] = useState(false);
  const [isJoiningQueue, setJoiningQueue] = useState(false);
  const hasReservationClock = Boolean(chargePoint?.reservedUntil || chargePoint?.myQueueEntry?.reservedUntil);
  const now = useNow(1000, hasReservationClock);
  const queueState = chargePoint ? getQueueState(chargePoint, now) : null;
  const sheetHeight = Math.min(SHEET_MAX_HEIGHT, screenHeight - insets.top - SHEET_TOP_CLEARANCE);
  const translateY = useSharedValue(sheetHeight * SHEET_RISE_RATIO);
  const scrim = useSharedValue(0);

  useEffect(() => {
    translateY.set(withTiming(0, { duration: motion.duration.sheet, easing: motion.easing.out }));
    scrim.set(withTiming(1, { duration: motion.duration.slow, easing: motion.easing.out }));
  }, [translateY, scrim]);

  const pan = Gesture.Pan()
    .activeOffsetY(PAN_ACTIVATION)
    .failOffsetX([-PAN_ACTIVATION, PAN_ACTIVATION])
    .onUpdate((event) => {
      translateY.set(Math.max(0, event.translationY));
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        scheduleOnRN(closeDetail);
      } else {
        translateY.set(withTiming(0, { duration: motion.duration.fast, easing: motion.easing.out }));
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.get() }));

  return (
    <View style={styles.root}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar detalhes do ponto"
          style={StyleSheet.absoluteFill}
          onPress={closeDetail}
        />
      </Animated.View>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Voltar ao mapa"
        onPress={closeDetail}
        scaleTo={0.92}
        style={[styles.back, { top: insets.top + spacing.sm }]}
      >
        <Icon icon={ChevronLeft} size={20} color={colors.textTitle} />
      </PressableScale>
      <Animated.View
        style={[styles.sheet, { height: sheetHeight + insets.bottom }, sheetStyle]}
        testID="charge-point-sheet"
      >
        <GestureDetector gesture={pan}>
          <View style={styles.grabberArea}>
            <View style={styles.grabber} />
          </View>
        </GestureDetector>
        {chargePoint ? (
          <>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <ChargePointDetails chargePoint={chargePoint} queueState={queueState} now={now} />
            </ScrollView>
            <Animated.View entering={rise(4)} style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
              <StartFooter
                chargePoint={chargePoint}
                queueState={queueState}
                now={now}
                onStart={() => setConfirming(true)}
                onJoinQueue={() => setJoiningQueue(true)}
              />
            </Animated.View>
          </>
        ) : isPending ? (
          <View style={styles.centered}>
            <ActivityIndicator accessibilityLabel="Carregando ponto de recarga" color={colors.accent} size="large" />
          </View>
        ) : (
          <View style={styles.content}>
            <Card variant="inset" style={styles.stack}>
              <Text style={styles.message}>
                {isError && error instanceof ChargingApiError && error.status === 404
                  ? 'Este ponto de recarga não existe ou não está disponível para você.'
                  : 'Não foi possível carregar o ponto de recarga.'}
              </Text>
              <Button
                label="Tentar novamente"
                icon={RotateCw}
                variant="outline"
                size="sm"
                loading={isRefetching}
                onPress={() => refetch()}
              />
            </Card>
          </View>
        )}
      </Animated.View>
      {chargePoint ? (
        <JoinQueueSheet chargePoint={chargePoint} visible={isJoiningQueue} onClose={() => setJoiningQueue(false)} />
      ) : null}
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

type StartFooterProps = {
  chargePoint: ChargePoint;
  queueState: QueueState | null;
  now: number;
  onStart: () => void;
  onJoinQueue: () => void;
};

function DirectionsButton({ chargePoint }: { chargePoint: ChargePoint }) {
  const toast = useToast();

  const open = () => {
    openDirections(chargePoint).catch(() =>
      toast.show('Não foi possível abrir o app de mapas.', { tone: 'error' }),
    );
  };

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="Como chegar"
      onPress={open}
      haptic="selection"
      scaleTo={0.92}
      style={styles.directions}
    >
      <Icon icon={Navigation} size={22} color={colors.textTitle} />
    </PressableScale>
  );
}

function FooterRow({ chargePoint, children, note }: { chargePoint: ChargePoint; children: ReactNode; note: string }) {
  return (
    <View style={styles.footerStack}>
      <View style={styles.footerRow}>
        <View style={styles.flex}>{children}</View>
        <DirectionsButton chargePoint={chargePoint} />
      </View>
      <Text style={styles.footnote}>{note}</Text>
    </View>
  );
}

function StartFooter({ chargePoint, queueState, now, onStart, onJoinQueue }: StartFooterProps) {
  const needsCardPayment = chargePoint.type === 'COMMERCIAL';
  const paymentNote = needsCardPayment
    ? 'Pré-autorização no cartão · só o consumido é cobrado ao encerrar'
    : 'Sem cartão · o consumo entra no rateio da sua unidade';

  if (queueState?.kind === 'can-join') {
    return (
      <FooterRow
        chargePoint={chargePoint}
        note={
          queueState.queueLength > 0
            ? `${formatQueueLength(queueState.queueLength)} agora · reserva de 10 min quando liberar`
            : 'Ninguém na fila agora · reserva de 10 min quando liberar'
        }
      >
        <Button label="Entrar na fila" icon={Clock} size="xl" block haptic onPress={onJoinQueue} />
      </FooterRow>
    );
  }

  if (queueState?.kind === 'waiting') {
    return <LeaveQueueFooter chargePoint={chargePoint} position={queueState.position} />;
  }

  if (queueState?.kind === 'reserved-for-other') {
    return (
      <FooterRow
        chargePoint={chargePoint}
        note={`Livre para o próximo da fila por mais ${formatClock(
          getRemainingSeconds(queueState.reservedUntil, now),
        )}`}
      >
        <Button label="Reservado para a fila" icon={Clock} size="xl" block disabled />
      </FooterRow>
    );
  }

  const canStart = chargePoint.status === 'AVAILABLE' && chargePoint.pricing !== null;
  const label = chargePoint.pricing ? unavailableLabels[chargePoint.status] : 'Tarifa não configurada';

  return (
    <FooterRow chargePoint={chargePoint} note={paymentNote}>
      <Button
        label={label}
        trailingIcon={Zap}
        trailingIconColor={palette.green500}
        size="xl"
        block
        haptic={canStart}
        disabled={!canStart}
        onPress={onStart}
      />
    </FooterRow>
  );
}

function LeaveQueueFooter({ chargePoint, position }: { chargePoint: ChargePoint; position: number }) {
  const toast = useToast();
  const leaveQueue = useLeaveQueue(chargePoint.id);

  const leave = () => {
    leaveQueue.mutate(undefined, {
      onSuccess: () => toast.show('Você saiu da fila deste ponto.', { tone: 'info' }),
      onError: (error) => toast.show(getLeaveQueueErrorMessage(error), { tone: 'error' }),
    });
  };

  return (
    <FooterRow
      chargePoint={chargePoint}
      note={`Você é o ${formatPosition(position)} da fila · avisamos quando for sua vez`}
    >
      <Button
        label="Sair da fila"
        icon={LogOut}
        variant="outline"
        size="xl"
        block
        loading={leaveQueue.isPending}
        onPress={leave}
      />
    </FooterRow>
  );
}

function useDistanceTo(chargePoint: ChargePoint) {
  const { data: chargePoints, isPending } = useChargePoints();
  const location = useMapCenter({ enabled: true, chargePoints, isLoading: isPending });
  return location.coordinates ? getDistanceMeters(location.coordinates, chargePoint) : null;
}

function ChargePointPhoto({ chargePoint }: { chargePoint: ChargePoint }) {
  const [failed, setFailed] = useState(false);

  if (!chargePoint.photoUrl || failed) {
    return (
      <View testID="charge-point-photo-fallback" style={[styles.photo, styles.photoFallback]}>
        <RingMark size={72} testID="ring-mark" />
      </View>
    );
  }

  return (
    <Image
      testID="charge-point-photo"
      source={{ uri: chargePoint.photoUrl }}
      accessibilityLabel={`Foto do ponto ${chargePoint.code}`}
      contentFit="cover"
      transition={motion.duration.slow}
      onError={() => setFailed(true)}
      style={styles.photo}
    />
  );
}

function InfoChip({ icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <View style={styles.chip}>
      <Icon icon={icon} size={15} color={colors.textMuted} />
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

type ChargePointDetailsProps = {
  chargePoint: ChargePoint;
  queueState: QueueState | null;
  now: number;
};

function ChargePointDetails({ chargePoint, queueState, now }: ChargePointDetailsProps) {
  const { pricing, charger } = chargePoint;
  const { garage, spot } = splitChargePointName(chargePoint.name);
  const availability = getAvailability(chargePoint, queueState);
  const distanceMeters = useDistanceTo(chargePoint);

  return (
    <>
      <Animated.View entering={rise(0)}>
        <ChargePointPhoto chargePoint={chargePoint} />
      </Animated.View>
      <Animated.View entering={rise(1)} style={styles.heading}>
        <Text accessibilityRole="header" style={styles.title}>
          {chargePoint.code} · {spot}
        </Text>
        <Text style={styles.subtitle}>
          {garage ? `${garage} · ${chargePoint.organizationName}` : chargePoint.organizationName}
        </Text>
        <View style={styles.availability}>
          <View style={[styles.availabilityDot, { backgroundColor: availability.dot }]} />
          <Text style={[styles.availabilityLabel, { color: availability.color }]}>{availability.label}</Text>
          {chargePoint.queueLength > 0 ? (
            <Text style={styles.queueLabel}>· {formatQueueLength(chargePoint.queueLength)}</Text>
          ) : null}
        </View>
      </Animated.View>
      <Animated.View entering={rise(2)} style={styles.chips}>
        {pricing ? <InfoChip icon={Zap} label={formatPricePerKwh(pricing.pricePerKwhCents)} /> : null}
        <InfoChip icon={Plug} label={formatPower(chargePoint.maxPowerKw)} />
        {distanceMeters === null ? null : <InfoChip icon={MapPin} label={formatDistance(distanceMeters)} />}
      </Animated.View>
      {pricing ? (
        <Animated.View entering={rise(2)}>
          <DemandBadge
            level={pricing.demandLevel}
            factor={pricing.demandFactor}
            source={pricing.demandFactorSource}
            modelVersion={pricing.demandModelVersion}
          />
        </Animated.View>
      ) : null}

      {queueState?.kind === 'reserved-for-me' ? (
        <InfoBanner tone="success" title="Reservado para você">
          {`É a sua vez! O ponto fica reservado por mais ${formatClock(getRemainingSeconds(queueState.reservedUntil, now))}. Inicie a recarga antes que a vez passe para o próximo.`}
        </InfoBanner>
      ) : null}
      {queueState?.kind === 'waiting' ? (
        <InfoBanner tone="info" title={`Você é o ${formatPosition(queueState.position)} da fila`}>
          {`${formatQueueLength(queueState.queueLength)} neste ponto. Quando ele liberar, avisamos e a vaga fica reservada por 10 minutos.`}
        </InfoBanner>
      ) : null}

      {pricing ? (
        <Animated.View entering={rise(3)}>
          <RegimeInfo type={chargePoint.type} pricing={pricing} />
        </Animated.View>
      ) : (
        <InfoBanner tone="warning" title="Tarifa não configurada">
          O gestor ainda não definiu a tarifa deste ponto, por isso não é possível iniciar uma recarga.
        </InfoBanner>
      )}

      {pricing || charger ? (
        <Animated.View entering={rise(3)}>
          <Card variant="inset" padding={0}>
            {pricing ? (
              <>
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
                  label="Taxa de ocupação"
                  value={`${formatCents(pricing.idleFeeCentsPerMinute)}/min`}
                  hint={`Após a tolerância, até ${formatCents(pricing.idleFeeCapCents)} por sessão`}
                  divider={charger !== null}
                />
              </>
            ) : null}
            {charger ? (
              <ListRow
                label="Carregador"
                value={charger.vendor}
                hint={`${connectorLabels[charger.connector]} · ${formatPower(chargePoint.maxPowerKw)}`}
                divider={false}
              />
            ) : null}
          </Card>
        </Animated.View>
      ) : null}
    </>
  );
}

export function getRegimeInfo(type: ChargePoint['type'], pricing: ChargePointPricing) {
  const tolerance = `Tolerância de ${pricing.gracePeriodMinutes} min após a carga completa.`;
  if (type === 'PRIVATE') {
    return {
      icon: ShieldCheck,
      title: 'Grupo A · rateio no condomínio',
      body: `Energia repassada a custo, sem margem (ANEEL RN 1.000/2021). ${tolerance}`,
    };
  }
  const base =
    pricing.baseRateCents === null
      ? 'Tarifa dinâmica travada no início da recarga.'
      : `Tarifa base de ${formatPricePerKwh(pricing.baseRateCents)} × fator de demanda, ` +
        'travada no início da recarga.';
  return {
    icon: CreditCard,
    title: 'Rede comercial · cobrança no cartão',
    body: `${base} Pré-autorização no cartão e só o consumido é cobrado. ${tolerance}`,
  };
}

function RegimeInfo({ type, pricing }: { type: ChargePoint['type']; pricing: ChargePointPricing }) {
  const info = getRegimeInfo(type, pricing);

  return (
    <View style={styles.info}>
      <Icon icon={info.icon} size={20} color={colors.infoText} style={styles.infoIcon} />
      <View style={styles.infoTexts}>
        <Text style={styles.infoTitle}>{info.title}</Text>
        <Text style={styles.infoBody}>{info.body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrim: {
    backgroundColor: nightColors.surfaceScrim,
  },
  back: {
    position: 'absolute',
    left: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceSheet,
    boxShadow: shadows.sheetNight,
    overflow: 'hidden',
  },
  grabberArea: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderSubtle,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    gap: spacing.md,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: colors.textBody,
  },
  photo: {
    height: PHOTO_HEIGHT,
    borderRadius: radii.xxl - 4,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceRaised,
  },
  photoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
  },
  heading: {
    gap: 6,
  },
  title: {
    fontSize: 32,
    lineHeight: 34,
    fontFamily: fonts.bold,
    letterSpacing: -1,
    color: colors.textTitle,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityLabel: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  queueLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.warningText,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceInset,
  },
  chipLabel: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceInset,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoTexts: {
    flex: 1,
    gap: 3,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  infoBody: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    backgroundColor: colors.surfaceSheet,
  },
  footerStack: {
    gap: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  directions: {
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
  },
  footnote: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    textAlign: 'center',
  },
});
