import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { colors, fonts, motion } from '@/constants/theme';
import { AuthBackButton } from '@/features/auth/components/auth-screen';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

export type AuthStepHeaderProps = {
  step: number;
  total: number;
  label: string;
  onBack: () => void;
};

export function AuthStepHeader({ step, total, label, onBack }: AuthStepHeaderProps) {
  return (
    <>
      <AuthBackButton onPress={onBack} />
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`Etapa ${step} de ${total}`}
        accessibilityValue={{ min: 0, max: total, now: step }}
        style={styles.progress}
      >
        <Text style={styles.label}>{`Etapa ${step} de ${total} · ${label}`}</Text>
        <View style={styles.segments}>
          {Array.from({ length: total }, (_, index) => (
            <View key={index} style={styles.track}>
              {index + 1 < step ? <View style={styles.fill} /> : null}
              {index + 1 === step ? <ActiveStepFill /> : null}
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

function ActiveStepFill() {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(reduceMotion ? 1 : withDelay(200, withTiming(1, { duration: 700, easing: motion.easing.out })));
  }, [progress, reduceMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.get() }] }));

  return <Animated.View style={[styles.fill, styles.growFromLeft, style]} />;
}

const styles = StyleSheet.create({
  progress: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  segments: {
    flexDirection: 'row',
    gap: 6,
  },
  track: {
    flex: 1,
    height: 4,
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
    backgroundColor: colors.textTitle,
  },
  growFromLeft: {
    transformOrigin: 'left',
  },
});
