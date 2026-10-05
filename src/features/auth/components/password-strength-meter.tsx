import { Check } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, motion } from '@/constants/theme';
import type { PasswordStrength } from '@/features/auth/password-strength';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

const SEGMENTS = 4;

function getSegmentColor(score: PasswordStrength['score']) {
  if (score <= 1) return colors.critical;
  if (score === 2) return colors.warning;
  return colors.energy;
}

export function PasswordStrengthLabel({ strength }: { strength: PasswordStrength }) {
  return (
    <Text accessibilityLiveRegion="polite" style={styles.strengthLabel}>
      {strength.label}
    </Text>
  );
}

export function PasswordStrengthMeter({ strength }: { strength: PasswordStrength }) {
  const color = getSegmentColor(strength.score);

  return (
    <View style={styles.container}>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Força da senha"
        accessibilityValue={{ min: 0, max: SEGMENTS, now: strength.score, text: strength.label || undefined }}
        style={styles.segments}
      >
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <View key={index} style={styles.track}>
            <Segment filled={index < strength.score} delay={index * motion.revealStagger} color={color} />
          </View>
        ))}
      </View>
      <View style={styles.rules}>
        <PasswordRule met={strength.hasMinLength} label="8+ caracteres" />
        <PasswordRule met={strength.hasNumber} label="Um número" />
      </View>
    </View>
  );
}

function Segment({ filled, delay, color }: { filled: boolean; delay: number; color: string }) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    const target = filled ? 1 : 0;
    if (reduceMotion) {
      progress.set(target);
      return;
    }
    progress.set(withDelay(filled ? delay : 0, withTiming(target, { duration: 420, easing: motion.easing.out })));
  }, [filled, delay, progress, reduceMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.get() }] }));

  return <Animated.View style={[styles.fill, { backgroundColor: color }, style]} />;
}

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}${met ? ', atendido' : ', pendente'}`}
      style={styles.rule}
    >
      {met ? <Icon icon={Check} size={14} strokeWidth={2.5} color={colors.energyText} /> : <View style={styles.ruleDot} />}
      <Text style={[styles.ruleLabel, met && styles.ruleLabelMet]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 10,
  },
  segments: {
    flexDirection: 'row',
    gap: 6,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.borderSubtle,
  },
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 999,
    transformOrigin: 'left',
  },
  rules: {
    flexDirection: 'row',
    gap: 16,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleDot: {
    width: 6,
    height: 6,
    marginHorizontal: 4,
    borderRadius: 3,
    backgroundColor: colors.borderDashed,
  },
  ruleLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  ruleLabelMet: {
    color: colors.energyText,
  },
  strengthLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
});
