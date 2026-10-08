import { router } from 'expo-router';

import { Rise } from '@/components/ui/rise';
import { useRegister } from '@/features/auth/api/use-register';
import { getRegisterErrorMessage } from '@/features/auth/auth-errors';
import { AuthFooterLink, AuthHeading, AuthScreen } from '@/features/auth/components/auth-screen';
import { AuthStepHeader } from '@/features/auth/components/auth-step-header';
import { OAuthButtons } from '@/features/auth/components/oauth-buttons';
import { RegisterForm } from '@/features/auth/components/register-form';

export function RegisterScreen() {
  const registerMutation = useRegister();
  const goToLogin = () => router.replace('/login');

  return (
    <AuthScreen
      header={<AuthStepHeader step={1} total={2} label="Seus dados" onBack={goToLogin} />}
      footer={<AuthFooterLink index={9} text="Já tem uma conta?" linkLabel="Entrar" onPress={goToLogin} />}
    >
      <AuthHeading title="Criar conta" subtitle="Leva menos de um minuto." />
      <RegisterForm
        riseIndex={2}
        onSubmit={({ name, email, password }) => registerMutation.mutate({ name, email, password })}
        isSubmitting={registerMutation.isPending}
        errorMessage={registerMutation.isError ? getRegisterErrorMessage(registerMutation.error) : null}
      />
      <Rise index={8}>
        <OAuthButtons />
      </Rise>
    </AuthScreen>
  );
}
