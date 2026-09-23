import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, fonts } from '@/constants/theme';
import { getInitials } from '@/features/account/account-initials';

export type AccountButtonProps = {
  name: string;
  hasPendingAction?: boolean;
};

export function AccountButton({ name, hasPendingAction = false }: AccountButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={hasPendingAction ? 'Conta, ação pendente' : 'Conta'}
      onPress={() => router.push('/account')}
      scaleTo={0.92}
      hitSlop={4}
      style={styles.avatar}
    >
      <Text style={styles.initials}>{getInitials(name)}</Text>
      {hasPendingAction ? <View testID="account-pending-dot" style={styles.dot} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentQuiet,
  },
  initials: {
    fontSize: 14,
    fontFamily: fonts.extrabold,
    color: colors.accentOnQuiet,
  },
  dot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.statusIdle,
    borderWidth: 2,
    borderColor: colors.bgBase,
  },
});
