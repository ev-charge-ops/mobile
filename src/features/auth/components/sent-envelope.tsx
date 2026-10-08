import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { colors, motion } from '@/constants/theme';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SIZE = 112;
const FLAP_LENGTH = 30;
const CHECK_LENGTH = 12;

export function SentEnvelope() {
  const reduceMotion = useReduceMotion();
  const envelope = useSharedValue(reduceMotion ? 1 : 0);
  const flap = useSharedValue(reduceMotion ? 1 : 0);
  const check = useSharedValue(reduceMotion ? 1 : 0);
  const halo = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      envelope.set(1);
      flap.set(1);
      check.set(1);
      halo.set(1);
      return;
    }
    envelope.set(withTiming(1, { duration: motion.duration.rise, easing: motion.easing.out }));
    flap.set(withDelay(340, withTiming(1, { duration: 560, easing: motion.easing.plug })));
    check.set(withDelay(700, withTiming(1, { duration: 450, easing: motion.easing.plug })));
    halo.set(withDelay(350, withTiming(1, { duration: 1200, easing: motion.easing.out })));
  }, [reduceMotion, envelope, flap, check, halo]);

  const envelopeStyle = useAnimatedStyle(() => ({
    opacity: envelope.get(),
    transform: [{ translateY: (1 - envelope.get()) * 10 }, { scale: 0.92 + envelope.get() * 0.08 }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0 : 0.7 * (1 - halo.get()),
    transform: [{ scale: 0.7 + halo.get() }],
  }));
  const flapProps = useAnimatedProps(() => ({ strokeDashoffset: FLAP_LENGTH * (1 - flap.get()) }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LENGTH * (1 - check.get()) }));

  return (
    <View style={styles.root} testID="sent-envelope">
      <Animated.View style={[styles.halo, haloStyle]} />
      <Animated.View style={[styles.circle, envelopeStyle]}>
        <Svg width={52} height={52} viewBox="0 0 24 24" fill="none">
          <Path
            d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"
            stroke={colors.energyText}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <AnimatedPath
            d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
            stroke={colors.energyText}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${FLAP_LENGTH}`}
            animatedProps={flapProps}
          />
          <AnimatedPath
            d="m16 19 2 2 4-4"
            stroke={colors.energyText}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${CHECK_LENGTH}`}
            animatedProps={checkProps}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  halo: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: colors.energy,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.energyTint,
  },
});
