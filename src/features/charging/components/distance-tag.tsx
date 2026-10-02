import { Navigation } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { fonts, getColors, radii, spacing, type ColorScheme } from '@/constants/theme';
import { formatDistance } from '@/features/charging/charge-point-distance';

export type DistanceTagProps = {
  distanceMeters: number | null | undefined;
  scheme?: ColorScheme;
};

export function DistanceTag({ distanceMeters, scheme = 'light' }: DistanceTagProps) {
  if (distanceMeters == null) return null;
  const tokens = getColors(scheme);

  return (
    <View testID="distance-tag" style={[styles.tag, { backgroundColor: tokens.statusInfoBg }]}>
      <Icon icon={Navigation} size={11} color={tokens.statusInfo} strokeWidth={2.6} />
      <Text style={[styles.label, { color: tokens.statusInfo }]}>{formatDistance(distanceMeters)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    marginTop: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.extrabold,
    fontVariant: ['tabular-nums'],
  },
});
