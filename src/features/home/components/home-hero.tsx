import { Image } from 'expo-image';
import { useIsFocused } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import carHero from '../../../../assets/media/car-hero.webp';
import carLoopPoster from '../../../../assets/media/car-loop-poster.webp';
import carLoop from '../../../../assets/media/car-loop.mp4';
import { StatusPill, type Status } from '@/components/ui/status-pill';
import { colors, fonts, palette, radii } from '@/constants/theme';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

export type HomeHeroSession = {
  isCharging: boolean;
  statusLabel: string;
  status: Status;
  pointLabel: string;
};

export type HomeHeroProps = {
  session: HomeHeroSession | null;
};

export function HomeHero({ session }: HomeHeroProps) {
  const reduceMotion = useReduceMotion();
  const playVideo = session?.isCharging === true && !reduceMotion;

  return (
    <View style={styles.hero} testID="home-hero">
      <Image
        source={session?.isCharging ? carLoopPoster : carHero}
        contentFit="cover"
        style={StyleSheet.absoluteFill}
        accessible={false}
        testID={session?.isCharging ? 'home-hero-poster' : 'home-hero-image'}
      />
      {playVideo ? <HeroVideo /> : null}
      {session ? (
        <View style={styles.chips}>
          <StatusPill
            label={session.statusLabel}
            status={session.status}
            live={session.isCharging}
            style={styles.statusChip}
          />
          <View style={styles.pointChip}>
            <Text numberOfLines={1} style={styles.pointLabel}>
              {session.pointLabel}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function HeroVideo() {
  const isFocused = useIsFocused();
  const player = useVideoPlayer(carLoop, (instance) => {
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
      testID="home-hero-video"
    />
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 190,
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: palette.ink300,
  },
  chips: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    gap: 6,
  },
  statusChip: {
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pointChip: {
    flexShrink: 1,
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pointLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textTitle,
  },
});
