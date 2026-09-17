import { router, useLocalSearchParams } from 'expo-router';
import { KeyRound, LogIn, Mail, Send } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { colors, spacing } from '@/constants/theme';
import { AuthApiError } from '@/features/auth/api/auth-api';
import { useRequestEmailLogin } from '@/features/auth/api/use-request-email-login';
import { useVerifyEmailLogin } from '@/features/auth/api/use-verify-email-login';
import {
  getEmailLoginCodeErrorMessage,
  getEmailLoginLinkErrorMessage,
  getEmailLoginRequestErrorMessage,
} from '@/features/auth/auth-errors';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { EmailCodeForm } from '@/features/auth/components/email-code-form';
import { EmailForm } from '@/features/auth/components/email-form';
import { FormError } from '@/features/auth/components/form-error';
import { useCooldown } from '@/features/auth/hooks/use-cooldown';
import { hasReturnTarget } from '@/features/auth/session/return-target';

export const RESEND_COOLDOWN_SECONDS = 30;

function goHomeUnlessReturning() {
  const isReturning = hasReturnTarget();
  return () => {
    if (!isReturning) router.replace('/');
  };
}

export function EmailLoginScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [prefersCode, setPrefersCode] = useState(false);

  if (token && !prefersCode) return <EmailLinkLogin token={token} onUseCode={() => setPrefersCode(true)} />;
  return <EmailCodeLogin />;
}

function EmailCodeLogin() {
  const [email, setEmail] = useState<string | null>(null);
  const requestMutation = useRequestEmailLogin();
  const verifyMutation = useVerifyEmailLogin();
  const cooldown = useCooldown();
  const toast = useToast();

  const applyRateLimit = (error: unknown) => {
    if (error instanceof AuthApiError && error.status === 429) {
      cooldown.start(error.retryAfterSeconds ?? RESEND_COOLDOWN_SECONDS);
    }
  };

  const requestCode = (address: string) =>
    requestMutation.mutate(address, {
      onSuccess: () => {
        setEmail(address);
        cooldown.start(RESEND_COOLDOWN_SECONDS);
      },
    });

  const resendCode = () => {
    if (!email) return;
    verifyMutation.reset();
    requestMutation.mutate(email, {
      onSuccess: () => {
        cooldown.start(RESEND_COOLDOWN_SECONDS);
        toast.show(`Enviamos um novo código para ${email}.`);
      },
      onError: (error) => {
        applyRateLimit(error);
        toast.show(getEmailLoginRequestErrorMessage(error), { tone: 'error' });
      },
    });
  };

  const changeEmail = () => {
    requestMutation.reset();
    verifyMutation.reset();
    setEmail(null);
  };

  const verifyCode = (code: string) => {
    if (!email) return;
    verifyMutation.mutate(
      { email, code },
      {
        onSuccess: goHomeUnlessReturning(),
        onError: applyRateLimit,
      },
    );
  };

  if (!email) {
    return (
      <AuthLayout
        title="Entrar com código"
        subtitle="Informe seu e-mail e enviaremos um código de 6 dígitos para você entrar sem senha."
        footerText="Prefere usar senha?"
        footerLinkLabel="Entrar com senha"
        footerHref="/login"
      >
        <EmailForm
          submitLabel="Enviar código"
          submitIcon={Send}
          onSubmit={(values) => requestCode(values.email)}
          isSubmitting={requestMutation.isPending}
          errorMessage={requestMutation.isError ? getEmailLoginRequestErrorMessage(requestMutation.error) : null}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Digite o código"
      subtitle={`Enviamos um código de 6 dígitos para ${email}. Ele expira em alguns minutos.`}
      footerText="Prefere usar senha?"
      footerLinkLabel="Entrar com senha"
      footerHref="/login"
    >
      <View style={styles.stack}>
        <EmailCodeForm
          onSubmit={(values) => verifyCode(values.code)}
          onResend={resendCode}
          resendCooldown={cooldown.remaining}
          isSubmitting={verifyMutation.isPending}
          isResending={requestMutation.isPending}
          errorMessage={verifyMutation.isError ? getEmailLoginCodeErrorMessage(verifyMutation.error) : null}
        />
        <Button label="Usar outro e-mail" icon={Mail} variant="ghost" block onPress={changeEmail} />
      </View>
    </AuthLayout>
  );
}

function EmailLinkLogin({ token, onUseCode }: { token: string; onUseCode: () => void }) {
  const { mutate, isError, error } = useVerifyEmailLogin();
  const requestedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (requestedTokenRef.current === token) return;
    requestedTokenRef.current = token;
    mutate({ token }, { onSuccess: goHomeUnlessReturning() });
  }, [token, mutate]);

  if (isError) {
    return (
      <AuthLayout
        title="Não foi possível entrar"
        subtitle="Solicite um novo código para acessar sua conta."
        footerLinkLabel="Voltar ao início"
        footerHref="/"
      >
        <View style={styles.stack}>
          <FormError message={getEmailLoginLinkErrorMessage(error)} />
          <Button label="Entrar com código" icon={KeyRound} size="lg" block onPress={onUseCode} />
          <Button label="Entrar com senha" icon={LogIn} variant="ghost" block onPress={() => router.replace('/login')} />
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Entrando na sua conta" subtitle="Aguarde só um instante.">
      <ActivityIndicator accessibilityLabel="Entrando" color={colors.accent} size="large" />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
});
