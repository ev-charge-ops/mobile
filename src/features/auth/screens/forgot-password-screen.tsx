import { router } from 'expo-router';
import { KeyRound, Mail } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Rise } from '@/components/ui/rise';
import { colors, fonts } from '@/constants/theme';
import { useForgotPassword } from '@/features/auth/api/use-forgot-password';
import { getForgotPasswordErrorMessage } from '@/features/auth/auth-errors';
import {
  AuthBackButton,
  AuthBarTitle,
  AuthHeading,
  AuthIconTile,
  AuthScreen,
} from '@/features/auth/components/auth-screen';
import { AuthTextButton } from '@/features/auth/components/auth-text-button';
import { EmailForm } from '@/features/auth/components/email-form';
import { SentEnvelope } from '@/features/auth/components/sent-envelope';

function goToLogin() {
  router.replace('/login');
}

export function ForgotPasswordScreen() {
  const forgotPasswordMutation = useForgotPassword();
  const header = (
    <>
      <AuthBackButton onPress={goToLogin} />
      <AuthBarTitle>Recuperar senha</AuthBarTitle>
    </>
  );

  if (forgotPasswordMutation.isSuccess) {
    const email = forgotPasswordMutation.variables;
    return (
      <AuthScreen
        header={header}
        footer={
          <>
            <Rise index={5}>
              <Button label="Voltar para entrar" size="lg" block haptic onPress={goToLogin} />
            </Rise>
            <Rise index={6}>
              <AuthTextButton label="Usar outro e-mail" onPress={() => forgotPasswordMutation.reset()} />
            </Rise>
          </>
        }
      >
        <View accessibilityRole="summary" accessibilityLiveRegion="polite" style={styles.sent}>
          <SentEnvelope />
          <Rise index={3} style={styles.sentTexts}>
            <Text accessibilityRole="header" style={styles.sentTitle}>
              Verifique seu e-mail
            </Text>
            <Text style={styles.sentBody}>
              Se houver uma conta com este e-mail, enviamos um link para redefinir sua senha. Ele vale por 30 minutos.
            </Text>
          </Rise>
          <Rise index={4} style={styles.emailChip}>
            <Icon icon={Mail} size={16} color={colors.textBody} />
            <Text numberOfLines={1} style={styles.emailChipText}>
              {email}
            </Text>
          </Rise>
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen header={header}>
      <AuthIconTile icon={KeyRound} />
      <AuthHeading
        title="Recuperar senha"
        subtitle="Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha."
      />
      <Rise index={2}>
        <EmailForm
          submitLabel="Enviar link"
          note="Entrou com Google ou Apple? Nesse caso, a senha é gerenciada pela sua conta nesses serviços."
          onSubmit={({ email }) => forgotPasswordMutation.mutate(email)}
          isSubmitting={forgotPasswordMutation.isPending}
          errorMessage={
            forgotPasswordMutation.isError ? getForgotPasswordErrorMessage(forgotPasswordMutation.error) : null
          }
        />
      </Rise>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  sent: {
    alignItems: 'center',
    paddingTop: 60,
  },
  sentTexts: {
    alignItems: 'center',
    gap: 10,
    marginTop: 32,
    maxWidth: 320,
  },
  sentTitle: {
    fontSize: 30,
    lineHeight: 33,
    fontFamily: fonts.bold,
    letterSpacing: -0.9,
    textAlign: 'center',
    color: colors.textTitle,
  },
  sentBody: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.medium,
    textAlign: 'center',
    color: colors.textBody,
  },
  emailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surfaceCard,
    maxWidth: '100%',
  },
  emailChipText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.semibold,
    color: colors.textBody,
  },
});
