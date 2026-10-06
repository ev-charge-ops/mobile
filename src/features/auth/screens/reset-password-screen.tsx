import { router, useLocalSearchParams } from 'expo-router';
import { KeyRound, Link2Off } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Rise } from '@/components/ui/rise';
import { useToast } from '@/components/ui/toast';
import { useResetPassword } from '@/features/auth/api/use-reset-password';
import { getResetPasswordErrorMessage } from '@/features/auth/auth-errors';
import {
  AuthBackButton,
  AuthBarTitle,
  AuthFooterLink,
  AuthHeading,
  AuthIconTile,
  AuthNote,
  AuthScreen,
} from '@/features/auth/components/auth-screen';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { useSession } from '@/features/auth/session/session-context';

function goHome() {
  router.replace('/');
}

export function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { status, endSession } = useSession();
  const resetPasswordMutation = useResetPassword();
  const toast = useToast();
  const header = (
    <>
      <AuthBackButton onPress={goHome} />
      <AuthBarTitle>Redefinir senha</AuthBarTitle>
    </>
  );

  if (!token) {
    return (
      <AuthScreen
        header={header}
        footer={
          <>
            <Rise index={4}>
              <Button
                label="Solicitar novo link"
                size="lg"
                block
                haptic
                onPress={() => router.replace(status === 'authenticated' ? '/' : '/forgot-password')}
              />
            </Rise>
            <AuthFooterLink index={5} text="Mudou de ideia?" linkLabel="Voltar ao início" onPress={goHome} />
          </>
        }
      >
        <AuthIconTile icon={Link2Off} tone="critical" />
        <AuthHeading
          title="Link inválido"
          subtitle="Este link de redefinição de senha está incompleto. Solicite um novo link."
        />
      </AuthScreen>
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
    <AuthScreen
      header={header}
      footer={<AuthFooterLink index={7} text="Mudou de ideia?" linkLabel="Voltar ao início" onPress={goHome} />}
    >
      <AuthIconTile icon={KeyRound} />
      <AuthHeading title="Criar nova senha" subtitle="Escolha uma nova senha para acessar sua conta." />
      <ResetPasswordForm
        riseIndex={2}
        onSubmit={({ password }) => submit(password)}
        isSubmitting={resetPasswordMutation.isPending}
        errorMessage={resetPasswordMutation.isError ? getResetPasswordErrorMessage(resetPasswordMutation.error) : null}
      />
      <AuthNote index={5}>Ao redefinir, todas as sessões abertas são encerradas e você entra de novo com a nova senha.</AuthNote>
    </AuthScreen>
  );
}
