import { useRegister } from '@/features/auth/api/use-register';
import { getRegisterErrorMessage } from '@/features/auth/auth-errors';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { RegisterForm } from '@/features/auth/components/register-form';

export function RegisterScreen() {
  const registerMutation = useRegister();

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para encontrar estações e iniciar recargas."
      footerText="Já tem uma conta?"
      footerLinkLabel="Entrar"
      footerHref="/login"
    >
      <RegisterForm
        onSubmit={({ name, email, password }) => registerMutation.mutate({ name, email, password })}
        isSubmitting={registerMutation.isPending}
        errorMessage={registerMutation.isError ? getRegisterErrorMessage(registerMutation.error) : null}
      />
    </AuthLayout>
  );
}
