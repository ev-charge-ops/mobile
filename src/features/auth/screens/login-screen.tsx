import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { useLogin } from '@/features/auth/api/use-login';
import { getLoginErrorMessage } from '@/features/auth/auth-errors';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { AuthLink } from '@/features/auth/components/auth-link';
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
      <Button
        label="Entrar com código por e-mail"
        icon={Mail}
        variant="outline"
        size="lg"
        block
        onPress={() => router.push('/login/email')}
      />
      <AuthLink href="/forgot-password" label="Esqueci minha senha" />
    </AuthLayout>
  );
}
