import { useToast } from '@/components/ui/toast';
import { useChangePassword } from '@/features/auth/api/use-change-password';
import { getChangePasswordErrorMessage } from '@/features/auth/auth-errors';
import type { ChangePasswordValues } from '@/features/auth/auth-schemas';
import { AuthBackButton, AuthBarTitle, AuthScreen } from '@/features/auth/components/auth-screen';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';

export type ChangePasswordScreenProps = {
  hasPassword: boolean;
  onBack: () => void;
  onDone: () => void;
};

export function ChangePasswordScreen({ hasPassword, onBack, onDone }: ChangePasswordScreenProps) {
  const changePassword = useChangePassword();
  const toast = useToast();

  const submit = ({ currentPassword, password }: ChangePasswordValues) =>
    changePassword.mutate(hasPassword ? { currentPassword, newPassword: password } : { newPassword: password }, {
      onSuccess: () => {
        toast.show(hasPassword ? 'Senha alterada' : 'Senha criada');
        onDone();
      },
    });

  return (
    <AuthScreen
      header={
        <>
          <AuthBackButton onPress={onBack} />
          <AuthBarTitle size="large">{hasPassword ? 'Alterar senha' : 'Criar senha'}</AuthBarTitle>
        </>
      }
    >
      <ChangePasswordForm
        requiresCurrentPassword={hasPassword}
        onSubmit={submit}
        isSubmitting={changePassword.isPending}
        errorMessage={changePassword.isError ? getChangePasswordErrorMessage(changePassword.error) : null}
      />
    </AuthScreen>
  );
}
