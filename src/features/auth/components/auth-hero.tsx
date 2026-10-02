import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import carHero from '../../../../assets/media/car-hero.webp';
import { Rise } from '@/components/ui/rise';
import { colors, fonts, radii } from '@/constants/theme';
import { BrandTile } from '@/features/auth/components/brand-tile';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

export const KEN_BURNS_MS = 14000;

export function AuthHero() {
  const reduceMotion = useReduceMotion();
  const zoom = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      zoom.set(0);
      return;
    }
    zoom.set(withRepeat(withTiming(1, { duration: KEN_BURNS_MS, easing: Easing.inOut(Easing.ease) }), -1, true));
    return () => cancelAnimation(zoom);
  }, [reduceMotion, zoom]);

  const imageStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + zoom.get() * 0.05 }] }));

  return (
    <Rise style={styles.hero} testID="auth-hero">
      <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
        <Image source={carHero} contentFit="cover" style={StyleSheet.absoluteFill} accessible={false} />
      </Animated.View>
      <View style={styles.chip}>
        <BrandTile size={26} />
        <Text style={styles.chipLabel}>EV ChargeOps</Text>
      </View>
    </Rise>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 232,
    borderRadius: radii.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised,
  },
  chip: {
    position: 'absolute',
    left: 14,
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceChrome,
  },
  chipLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.bold,
    letterSpacing: -0.14,
    color: colors.textTitle,
  },
});
