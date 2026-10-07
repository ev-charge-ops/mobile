import { useIsFocused } from 'expo-router';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { motion, palette } from '@/constants/theme';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

import carTopAmberPoster from '../../../../assets/media/car-top-amber-poster.webp';
import carTopAmber from '../../../../assets/media/car-top-amber.mp4';
import carTopGreenPoster from '../../../../assets/media/car-top-green-poster.webp';
import carTopGreen from '../../../../assets/media/car-top-green.mp4';
import carTopRedPoster from '../../../../assets/media/car-top-red-poster.webp';
import carTopRed from '../../../../assets/media/car-top-red.mp4';

export const PLUG_TRAVEL = 46;
const PLUG_HOLD = 1200;
const TILE_WIDTH = 150;
const TILE_HEIGHT = 220;

export type CarTopTone = 'charging' | 'grace' | 'idle';

const toneMedia: Record<CarTopTone, { video: number; poster: number; port: string; glow: string }> = {
  charging: { video: carTopGreen, poster: carTopGreenPoster, port: palette.green500, glow: 'rgba(61,220,132,0.25)' },
  grace: { video: carTopAmber, poster: carTopAmberPoster, port: palette.amber500, glow: 'rgba(242,169,59,0.25)' },
  idle: { video: carTopRed, poster: carTopRedPoster, port: palette.red500, glow: 'rgba(229,72,77,0.25)' },
};

function CarTopVideo({ source }: { source: number }) {
  const isFocused = useIsFocused();
  const player = useVideoPlayer(source, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.audioMixingMode = 'mixWithOthers';
  });

  useEffect(() => {
    if (isFocused) player.play();
    else player.pause();
  }, [isFocused, player]);

  return (
    <VideoView
      player={player}
      contentFit="cover"
      nativeControls={false}
      surfaceType="textureView"
      style={StyleSheet.absoluteFill}
      accessible={false}
      testID="car-top-video"
    />
  );
}

export type CarTopTileProps = {
  plugged: boolean;
  animatePlug?: boolean;
  tone?: CarTopTone;
};

export function CarTopTile({ plugged, animatePlug = false, tone = 'charging' }: CarTopTileProps) {
  const media = toneMedia[tone];
  const reduceMotion = useReduceMotion();
  const shouldAnimate = animatePlug && !reduceMotion;
  const connector = useSharedValue(shouldAnimate ? PLUG_TRAVEL : 0);
  const connectorOpacity = useSharedValue(shouldAnimate ? 1 : 0);
  const port = useSharedValue(plugged && !shouldAnimate ? 1 : 0);

  useEffect(() => {
    if (!shouldAnimate) {
      port.set(withTiming(plugged ? 1 : 0, { duration: motion.duration.slow }));
      return;
    }
    connectorOpacity.set(1);
    connector.set(PLUG_TRAVEL);
    connector.set(withTiming(0, { duration: motion.duration.plug, easing: motion.easing.plug }));
    port.set(withDelay(motion.duration.plug * 0.8, withTiming(1, { duration: motion.duration.fast })));
    connectorOpacity.set(
      withSequence(
        withTiming(1, { duration: motion.duration.plug + PLUG_HOLD }),
        withTiming(0, { duration: motion.duration.slow }),
      ),
    );
  }, [shouldAnimate, plugged, connector, connectorOpacity, port]);

  const connectorStyle = useAnimatedStyle(() => ({
    opacity: connectorOpacity.get(),
    transform: [{ translateX: connector.get() }],
  }));
  const portStyle = useAnimatedStyle(() => ({
    backgroundColor: port.get() > 0.5 ? media.port : palette.ink400,
    boxShadow: `0 0 0 ${6 * port.get()}px ${media.glow}`,
  }));

  return (
    <View style={styles.tile} testID="car-top-tile">
      <View style={styles.clip}>
        {reduceMotion ? (
          <Image
            testID="car-top-poster"
            source={media.poster}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
            accessible={false}
          />
        ) : (
          <CarTopVideo key={tone} source={media.video} />
        )}
      </View>
      <Animated.View testID="car-port" style={[styles.port, portStyle]} />
      {shouldAnimate ? (
        <Animated.View testID="plug-connector" pointerEvents="none" style={[styles.connector, connectorStyle]}>
          <View style={styles.connectorHead} />
          <View style={styles.cable} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: 40,
    borderCurve: 'continuous',
    backgroundColor: '#121214',
  },
  clip: {
    ...StyleSheet.absoluteFill,
    borderRadius: 40,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  port: {
    position: 'absolute',
    right: 10,
    top: TILE_HEIGHT * 0.3,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connector: {
    position: 'absolute',
    left: TILE_WIDTH - 2,
    top: TILE_HEIGHT * 0.3 - 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectorHead: {
    width: 16,
    height: 12,
    borderRadius: 3,
    backgroundColor: palette.white,
  },
  cable: {
    width: 70,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.white,
  },
});
