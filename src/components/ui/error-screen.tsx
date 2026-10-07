import { LogOut, RotateCw, TriangleAlert } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { colors, radii, spacing, typography } from '@/constants/theme';

export type ErrorScreenProps = {
  title?: string;
  message?: string;
  details?: string | null;
  onRetry: () => void;
  isRetrying?: boolean;
  onSignOut?: () => void;
  isSigningOut?: boolean;
};

export function ErrorScreen({
  title = 'Algo deu errado',
  message = 'Não foi possível exibir esta tela. Tente novamente em instantes.',
  details,
  onRetry,
  isRetrying = false,
  onSignOut,
  isSigningOut = false,
}: ErrorScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Icon icon={TriangleAlert} size={28} color={colors.statusFault} />
        </View>
        <Text accessibilityRole="header" style={[typography.title, styles.centered]}>
          {title}
        </Text>
        <Text style={[styles.message, styles.centered]}>{message}</Text>
        {details ? <Text style={[typography.mono, styles.centered]}>{details}</Text> : null}
        <View style={styles.actions}>
          <Button
            label="Tentar novamente"
            icon={RotateCw}
            size="lg"
            block
            loading={isRetrying}
            disabled={isSigningOut}
            onPress={onRetry}
          />
          {onSignOut ? (
            <Button
              label="Sair"
              icon={LogOut}
              variant="outline"
              size="lg"
              block
              loading={isSigningOut}
              disabled={isRetrying}
              onPress={onSignOut}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.statusFaultBg,
  },
  centered: {
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
