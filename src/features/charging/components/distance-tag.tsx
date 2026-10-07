import { Navigation } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { formatDistance } from '@/features/charging/charge-point-distance';

export function DistanceTag({ distanceMeters }: { distanceMeters: number | null | undefined }) {
  if (distanceMeters == null) return null;

  return (
    <View testID="distance-tag" style={styles.tag}>
      <Icon icon={Navigation} size={11} color={colors.statusInfo} strokeWidth={2.6} />
      <Text style={styles.label}>{formatDistance(distanceMeters)}</Text>
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
    backgroundColor: colors.statusInfoBg,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.extrabold,
    color: colors.statusInfo,
    fontVariant: ['tabular-nums'],
  },
});
