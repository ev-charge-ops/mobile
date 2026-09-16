import { useLogin } from '@/features/auth/api/use-login';
import { getLoginErrorMessage } from '@/features/auth/auth-errors';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';

export function LoginScreen() {
  const loginMutation = useLogin();

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para acompanhar estações e recargas."
      footerText="Ainda não tem conta?"
      footerLinkLabel="Criar conta"
      footerHref="/register"
    >
      <LoginForm
        onSubmit={(values) => loginMutation.mutate(values)}
        isSubmitting={loginMutation.isPending}
        errorMessage={loginMutation.isError ? getLoginErrorMessage(loginMutation.error) : null}
      />
    </AuthLayout>
  );
}
