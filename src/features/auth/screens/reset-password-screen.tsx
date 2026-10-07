import { router, useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useResetPassword } from '@/features/auth/api/use-reset-password';
import { getResetPasswordErrorMessage } from '@/features/auth/auth-errors';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { useSession } from '@/features/auth/session/session-context';

export function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { status, endSession } = useSession();
  const resetPasswordMutation = useResetPassword();
  const toast = useToast();

  if (!token) {
    return (
      <AuthLayout
        title="Link inválido"
        subtitle="Este link de redefinição de senha está incompleto. Solicite um novo link."
        footerLinkLabel="Voltar ao início"
        footerHref="/"
      >
        <Button
          label="Solicitar novo link"
          icon={Send}
          size="lg"
          block
          onPress={() => router.replace(status === 'authenticated' ? '/' : '/forgot-password')}
        />
      </AuthLayout>
    );
  }

  const submit = (password: string) =>
    resetPasswordMutation.mutate(
      { token, password },
      {
        onSuccess: async () => {
          if (status === 'authenticated') await endSession();
          toast.show('Senha redefinida. Entre com a nova senha.');
          router.replace('/login');
        },
      },
    );

  return (
    <AuthLayout
      title="Criar nova senha"
      subtitle="Escolha uma nova senha para acessar sua conta."
      footerLinkLabel="Voltar ao início"
      footerHref="/"
    >
      <ResetPasswordForm
        onSubmit={({ password }) => submit(password)}
        isSubmitting={resetPasswordMutation.isPending}
        errorMessage={resetPasswordMutation.isError ? getResetPasswordErrorMessage(resetPasswordMutation.error) : null}
      />
    </AuthLayout>
  );
}
