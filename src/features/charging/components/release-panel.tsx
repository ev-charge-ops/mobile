import { Check, Circle, LoaderCircle, PlugZap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { FadeInItem } from '@/components/ui/fade-in-item';
import { Icon } from '@/components/ui/icon';
import { ProgressMeter } from '@/components/ui/progress-meter';
import { colors, fonts, motion, radii, spacing } from '@/constants/theme';
import type { ChargingSession } from '@/features/charging/api/charging-api';
import { getReleaseStep, getReleaseSteps, RELEASE_STEP_COUNT } from '@/features/charging/session-progress';
import { useNow } from '@/hooks/use-now';

const plugSize = 104;

function Spinner() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.set(withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1));
  }, [rotation]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));

  return (
    <Animated.View style={style}>
      <Icon icon={LoaderCircle} size={15} color={colors.textTitle} />
    </Animated.View>
  );
}

function PlugHalo() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1260, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
      ),
    );
  }, [pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - pulse.get()),
    transform: [{ scale: 1 + pulse.get() * 0.42 }],
  }));

  return (
    <View style={styles.plugWrap}>
      <Animated.View style={[styles.halo, haloStyle]} />
      <View style={styles.plugCircle}>
        <Icon icon={PlugZap} size={44} color={colors.statusCharging} />
      </View>
    </View>
  );
}

export function ReleasePanel({ session }: { session: ChargingSession }) {
  const [mountedAt] = useState(() => Date.now());
  const now = useNow(250, session.status === 'PENDING');
  const current = getReleaseStep(session.status, now - mountedAt);
  const steps = getReleaseSteps(session);

  return (
    <View style={styles.root}>
      <PlugHalo />
      <View style={styles.heading}>
        <Text style={styles.title}>Liberando o carregador</Text>
        <Text style={styles.subtitle}>Mantenha o cabo conectado ao veículo. Isso leva alguns segundos.</Text>
      </View>
      <View style={styles.steps}>
        {steps.map((step, index) => {
          const done = current > index;
          const active = current === index;
          return (
            <FadeInItem key={step.label} index={index} style={styles.step} testID={`release-step-${index}`}>
              <View
                style={[styles.stepIcon, done && styles.stepIconDone, active && styles.stepIconActive]}
                accessibilityLabel={done ? 'Concluído' : active ? 'Em andamento' : 'Pendente'}
              >
                {done ? (
                  <Animated.View entering={ZoomIn.duration(180).easing(motion.easing.out)}>
                    <Icon icon={Check} size={15} color={colors.statusCharging} strokeWidth={2.6} />
                  </Animated.View>
                ) : active ? (
                  <Spinner />
                ) : (
                  <Icon icon={Circle} size={15} color={colors.textDisabled} />
                )}
              </View>
              <View style={styles.stepTexts}>
                <Text style={[styles.stepLabel, !(done || active) && styles.stepLabelPending]}>{step.label}</Text>
                <Text style={styles.stepHint}>{step.hint}</Text>
              </View>
            </FadeInItem>
          );
        })}
      </View>
      <ProgressMeter value={current} max={RELEASE_STEP_COUNT} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xxxl,
    paddingTop: spacing.xxl,
  },
  plugWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: plugSize,
    height: plugSize,
    borderRadius: plugSize / 2,
    backgroundColor: colors.statusCharging,
  },
  plugCircle: {
    width: plugSize,
    height: plugSize,
    borderRadius: plugSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.statusChargingBg,
  },
  heading: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fonts.extrabold,
    letterSpacing: -0.2,
    color: colors.textTitle,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  steps: {
    gap: 1,
    overflow: 'hidden',
    borderRadius: radii.card,
    backgroundColor: colors.hairline,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.lg,
    backgroundColor: colors.surfaceCard,
  },
  stepIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: {
    backgroundColor: colors.statusChargingBg,
  },
  stepIconActive: {
    backgroundColor: colors.surfaceInset,
  },
  stepTexts: {
    flex: 1,
    minWidth: 0,
  },
  stepLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.textTitle,
  },
  stepLabelPending: {
    color: colors.textDisabled,
  },
  stepHint: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 1,
  },
});
