import { MailWarning, Send } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { useResendEmailVerification } from '@/features/auth/api/use-resend-email-verification';
import { getResendVerificationErrorMessage } from '@/features/auth/auth-errors';

export type EmailVerificationBannerProps = {
  email: string;
};

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const resendMutation = useResendEmailVerification();
  const toast = useToast();

  const resend = () =>
    resendMutation.mutate(undefined, {
      onSuccess: () => toast.show(`Enviamos um novo link para ${email}.`),
      onError: (error) => toast.show(getResendVerificationErrorMessage(error), { tone: 'error' }),
    });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Icon icon={MailWarning} size={20} color={colors.statusIdle} />
        <Text style={styles.title}>Confirme seu e-mail</Text>
      </View>
      <Text style={styles.message}>
        Enviamos um link de confirmação para {email}. Abra o e-mail para verificar sua conta.
      </Text>
      <Button
        label="Reenviar e-mail"
        icon={Send}
        variant="secondary"
        size="sm"
        loading={resendMutation.isPending}
        onPress={resend}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.statusIdleBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
  },
});
