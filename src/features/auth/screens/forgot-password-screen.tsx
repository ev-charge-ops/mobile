import { router } from 'expo-router';
import { LogIn, RotateCw } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { spacing } from '@/constants/theme';
import { useForgotPassword } from '@/features/auth/api/use-forgot-password';
import { getForgotPasswordErrorMessage } from '@/features/auth/auth-errors';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export function ForgotPasswordScreen() {
  const forgotPasswordMutation = useForgotPassword();

  if (forgotPasswordMutation.isSuccess) {
    return (
      <AuthLayout
        title="Verifique seu e-mail"
        subtitle={`Se houver uma conta para ${forgotPasswordMutation.variables}, enviaremos um link para redefinir sua senha.`}
      >
        <View style={styles.actions}>
          <Button label="Voltar ao login" icon={LogIn} size="lg" block onPress={() => router.replace('/login')} />
          <Button
            label="Usar outro e-mail"
            icon={RotateCw}
            variant="ghost"
            block
            onPress={() => forgotPasswordMutation.reset()}
          />
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Esqueci minha senha"
      subtitle="Informe seu e-mail e enviaremos um link para você criar uma nova senha."
      footerText="Lembrou a senha?"
      footerLinkLabel="Entrar"
      footerHref="/login"
    >
      <ForgotPasswordForm
        onSubmit={({ email }) => forgotPasswordMutation.mutate(email)}
        isSubmitting={forgotPasswordMutation.isPending}
        errorMessage={forgotPasswordMutation.isError ? getForgotPasswordErrorMessage(forgotPasswordMutation.error) : null}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
  },
});
