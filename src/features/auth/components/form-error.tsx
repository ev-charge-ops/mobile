import { CircleAlert } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, radii, spacing } from '@/constants/theme';

export function FormError({ message }: { message: string }) {
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.container}>
      <Icon icon={CircleAlert} size={18} color={colors.statusFault} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.input,
    backgroundColor: colors.statusFaultBg,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.statusFault,
  },
});
