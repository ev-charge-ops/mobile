import { Clock } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { formatQueueLength } from '@/features/charging/charge-point-queue';

export function QueueLengthTag({ queueLength }: { queueLength: number }) {
  if (queueLength <= 0) return null;

  return (
    <View testID="queue-length-tag" style={styles.tag}>
      <Icon icon={Clock} size={12} color={colors.statusIdle} />
      <Text style={styles.label}>{formatQueueLength(queueLength)}</Text>
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
    backgroundColor: colors.statusIdleBg,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.statusIdle,
  },
});
