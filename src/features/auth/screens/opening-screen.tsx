import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors, fonts, motion } from '@/constants/theme';
import { BRAND_BOLT_PATH, BRAND_NODE, BRAND_RING_PATH } from '@/features/auth/components/brand-tile';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const TILE_SIZE = 104;
const TILE_SCALE = TILE_SIZE / 64;
const RING_LENGTH = 96;
const LOADER_WIDTH = 120;
const LOADER_BAR_WIDTH = LOADER_WIDTH * 0.4;

export const OPENING_INTRO_MS = 1700;
export const OPENING_EXIT_MS = motion.duration.slow;

const timeline = {
  tile: { delay: 0, duration: 500 },
  ring: { delay: 300, duration: motion.duration.splash },
  bolt: { delay: 970, duration: 630 },
  node: { delay: 1350, duration: 400 },
  wordmark: { delay: 1450, duration: motion.duration.rise },
  tagline: { delay: 1500, duration: motion.duration.rise },
  loader: { delay: 1550, duration: motion.duration.rise },
} as const;

function useEntrance(step: { delay: number; duration: number }, easing: (typeof motion.easing)[keyof typeof motion.easing], reduceMotion: boolean) {
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.set(1);
      return;
    }
    progress.set(withDelay(step.delay, withTiming(1, { duration: step.duration, easing })));
  }, [progress, reduceMotion, step, easing]);

  return progress;
}

function useRiseStyle(progress: SharedValue<number>) {
  return useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * 14 }],
  }));
}

export type OpeningScreenProps = {
  ready: boolean;
  onDone: () => void;
};

export function OpeningScreen({ ready, onDone }: OpeningScreenProps) {
  const reduceMotion = useReduceMotion();
  const [introDone, setIntroDone] = useState(false);
  const exiting = ready && (introDone || reduceMotion);

  const tile = useEntrance(timeline.tile, motion.easing.out, reduceMotion);
  const ring = useEntrance(timeline.ring, motion.easing.plug, reduceMotion);
  const bolt = useEntrance(timeline.bolt, motion.easing.out, reduceMotion);
  const node = useEntrance(timeline.node, motion.easing.out, reduceMotion);
  const wordmark = useEntrance(timeline.wordmark, motion.easing.out, reduceMotion);
  const tagline = useEntrance(timeline.tagline, motion.easing.out, reduceMotion);
  const loader = useEntrance(timeline.loader, motion.easing.out, reduceMotion);
  const sweep = useSharedValue(0);
  const visibility = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    const timeout = setTimeout(() => setIntroDone(true), OPENING_INTRO_MS);
    return () => clearTimeout(timeout);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    sweep.set(withRepeat(withTiming(1, { duration: motion.duration.live, easing: motion.easing.plug }), -1, false));
    return () => cancelAnimation(sweep);
  }, [reduceMotion, sweep]);

  useEffect(() => {
    if (!exiting) return;
    const duration = reduceMotion ? 0 : OPENING_EXIT_MS;
    visibility.set(withTiming(0, { duration, easing: motion.easing.standard }));
    const timeout = setTimeout(onDone, duration);
    return () => clearTimeout(timeout);
  }, [exiting, reduceMotion, visibility, onDone]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: visibility.get() }));
  const tileStyle = useAnimatedStyle(() => ({
    opacity: tile.get(),
    transform: [{ scale: 0.92 + tile.get() * 0.08 }],
  }));
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: RING_LENGTH * (1 - ring.get()) }));
  const boltStyle = useAnimatedStyle(() => ({
    opacity: bolt.get(),
    transform: [{ translateY: (1 - bolt.get()) * -6 * TILE_SCALE }],
  }));
  const nodeStyle = useAnimatedStyle(() => ({
    opacity: node.get(),
    transform: [{ scale: node.get() }],
  }));
  const wordmarkStyle = useRiseStyle(wordmark);
  const taglineStyle = useRiseStyle(tagline);
  const loaderStyle = useRiseStyle(loader);
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -LOADER_BAR_WIDTH + sweep.get() * (LOADER_WIDTH + LOADER_BAR_WIDTH) }],
  }));

  const nodeSize = BRAND_NODE.r * 2 * TILE_SCALE;

  return (
    <Animated.View
      testID="opening-screen"
      pointerEvents={exiting ? 'none' : 'auto'}
      style={[StyleSheet.absoluteFill, styles.screen, rootStyle]}
    >
      <View style={styles.center}>
        <Animated.View
          accessible
          accessibilityRole="image"
          accessibilityLabel="EV ChargeOps"
          style={[styles.tile, tileStyle]}
        >
          <Svg width={TILE_SIZE} height={TILE_SIZE} viewBox="0 0 64 64">
            <Rect width={64} height={64} rx={18} fill={colors.surfaceInverse} />
            <AnimatedPath
              d={BRAND_RING_PATH}
              fill="none"
              stroke={colors.textOnInverse}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={`${RING_LENGTH}`}
              animatedProps={ringProps}
            />
          </Svg>
          <Animated.View style={[StyleSheet.absoluteFill, boltStyle]}>
            <Svg width={TILE_SIZE} height={TILE_SIZE} viewBox="0 0 64 64">
              <Path d={BRAND_BOLT_PATH} fill={colors.energyBright} />
            </Svg>
          </Animated.View>
          <Animated.View
            style={[
              styles.node,
              {
                width: nodeSize,
                height: nodeSize,
                left: BRAND_NODE.cx * TILE_SCALE - nodeSize / 2,
                top: BRAND_NODE.cy * TILE_SCALE - nodeSize / 2,
              },
              nodeStyle,
            ]}
          />
        </Animated.View>
        <Animated.Text style={[styles.wordmark, wordmarkStyle]}>EV ChargeOps</Animated.Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>Recarga compartilhada, conta clara</Animated.Text>
      </View>
      <Animated.View style={[styles.footer, loaderStyle]} pointerEvents="none">
        <View accessible accessibilityRole="progressbar" accessibilityLabel="Carregando" style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderBar, sweepStyle]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.bgBase,
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  node: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.energyBright,
  },
  wordmark: {
    marginTop: 28,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: fonts.bold,
    letterSpacing: -0.9,
    color: colors.textTitle,
  },
  tagline: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 56,
    alignItems: 'center',
  },
  loaderTrack: {
    width: LOADER_WIDTH,
    height: 3,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.borderSubtle,
  },
  loaderBar: {
    width: LOADER_BAR_WIDTH,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.textTitle,
  },
});
