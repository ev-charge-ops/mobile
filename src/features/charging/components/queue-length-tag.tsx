import { Clock } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { fonts, getColors, radii, spacing, type ColorScheme } from '@/constants/theme';
import { formatQueueLength } from '@/features/charging/charge-point-queue';

export type QueueLengthTagProps = {
  queueLength: number;
  scheme?: ColorScheme;
};

export function QueueLengthTag({ queueLength, scheme = 'light' }: QueueLengthTagProps) {
  if (queueLength <= 0) return null;
  const tokens = getColors(scheme);

  return (
    <View testID="queue-length-tag" style={[styles.tag, { backgroundColor: tokens.statusIdleBg }]}>
      <Icon icon={Clock} size={12} color={tokens.statusIdle} />
      <Text style={[styles.label, { color: tokens.statusIdle }]}>{formatQueueLength(queueLength)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
});
