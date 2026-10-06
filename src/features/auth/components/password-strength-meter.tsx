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

function StrengthSegments({ strength, height = 6 }: { strength: PasswordStrength; height?: number }) {
  const color = getSegmentColor(strength.score);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Força da senha"
      accessibilityValue={{ min: 0, max: SEGMENTS, now: strength.score, text: strength.label || undefined }}
      style={styles.segments}
    >
      {Array.from({ length: SEGMENTS }, (_, index) => (
        <View key={index} style={[styles.track, { height }]}>
          <Segment filled={index < strength.score} delay={index * motion.revealStagger} color={color} />
        </View>
      ))}
    </View>
  );
}

export function PasswordStrengthMeter({ strength }: { strength: PasswordStrength }) {
  return (
    <View style={styles.container}>
      <StrengthSegments strength={strength} />
      <View style={styles.rules}>
        <PasswordRule met={strength.hasMinLength} label="8+ caracteres" />
        <PasswordRule met={strength.hasNumber} label="Um número" />
      </View>
    </View>
  );
}

export type PasswordChecklistRule = {
  label: string;
  met: boolean;
};

export function PasswordStrengthCard({
  strength,
  rules,
}: {
  strength: PasswordStrength;
  rules: PasswordChecklistRule[];
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardMeter}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Força da senha</Text>
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.cardStrength, { color: strength.score >= 3 ? colors.energyText : colors.textMuted }]}
          >
            {strength.label}
          </Text>
        </View>
        <StrengthSegments strength={strength} height={8} />
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.checklist}>
        {rules.map((rule) => (
          <ChecklistRule key={rule.label} rule={rule} />
        ))}
      </View>
    </View>
  );
}

function ChecklistRule({ rule }: { rule: PasswordChecklistRule }) {
  return (
    <View
      accessible
      accessibilityLabel={`${rule.label}${rule.met ? ', atendido' : ', pendente'}`}
      style={styles.checklistRow}
    >
      <View style={[styles.checkCircle, rule.met && styles.checkCircleMet]}>
        {rule.met ? <Icon icon={Check} size={14} strokeWidth={3} color={colors.energyText} /> : null}
      </View>
      <Text style={[styles.checklistLabel, rule.met && styles.checklistLabelMet]}>{rule.label}</Text>
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
  card: {
    gap: 14,
    padding: 16,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceCard,
  },
  cardMeter: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  cardStrength: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.bold,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  checklist: {
    gap: 10,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.hairline,
  },
  checkCircleMet: {
    backgroundColor: colors.energyTint,
  },
  checklistLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  checklistLabelMet: {
    color: colors.textTitle,
  },
  strengthLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
});
