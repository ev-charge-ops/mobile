import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { RingMark } from '@/components/ui/ring-mark';
import { StatusPill } from '@/components/ui/status-pill';
import { colors, fonts, palette } from '@/constants/theme';
import type { HomePoint } from '@/features/home/home-summary';

export type HomePointRowProps = {
  point: HomePoint;
};

export function HomePointRow({ point }: HomePointRowProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${point.title}, ${point.details.join(', ')}, ${point.statusLabel}`}
      scaleTo={0.98}
      onPress={() => router.push({ pathname: '/charge-points/[chargePointId]', params: { chargePointId: point.id } })}
      style={styles.row}
      testID={`home-point-${point.id}`}
    >
      <PointPhoto uri={point.photoUrl} />
      <View style={styles.texts}>
        <Text numberOfLines={1} style={styles.title}>
          {point.title}
        </Text>
        <View style={styles.details}>
          {point.details.map((detail) => (
            <Text key={detail} numberOfLines={1} style={styles.detail}>
              {detail}
            </Text>
          ))}
        </View>
      </View>
      <StatusPill label={point.statusLabel} status={point.status} live={false} />
    </PressableScale>
  );
}

export function PointPhoto({ uri }: { uri: string | null }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        contentFit="cover"
        transition={200}
        style={styles.photo}
        accessible={false}
        testID="home-point-photo"
      />
    );
  }

  return (
    <View style={[styles.photo, styles.placeholder]} testID="home-point-placeholder">
      <RingMark size={30} ringColor={palette.ink500} boltColor={palette.ink500} nodeColor={null} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceCard,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  placeholder: {
    backgroundColor: palette.ink300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
  },
  detail: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
});
