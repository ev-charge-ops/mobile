import { router, useLocalSearchParams } from 'expo-router';
import { Mail, MailX } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { Rise } from '@/components/ui/rise';
import { useToast } from '@/components/ui/toast';
import { colors } from '@/constants/theme';
import { AuthApiError } from '@/features/auth/api/auth-api';
import { useRequestEmailLogin } from '@/features/auth/api/use-request-email-login';
import { useVerifyEmailLogin } from '@/features/auth/api/use-verify-email-login';
import {
  getEmailLoginCodeErrorMessage,
  getEmailLoginLinkErrorMessage,
  getEmailLoginRequestErrorMessage,
} from '@/features/auth/auth-errors';
import {
  AuthBackButton,
  AuthFooterLink,
  AuthHeading,
  AuthIconTile,
  AuthScreen,
  authTextStyles,
} from '@/features/auth/components/auth-screen';
import { EmailCodeForm } from '@/features/auth/components/email-code-form';
import { EmailForm } from '@/features/auth/components/email-form';
import { FormError } from '@/features/auth/components/form-error';
import { useCooldown } from '@/features/auth/hooks/use-cooldown';
import { hasReturnTarget } from '@/features/auth/session/return-target';

export const RESEND_COOLDOWN_SECONDS = 30;

function goToLogin() {
  router.replace('/login');
}

function leaveEmailLogin() {
  if (router.canGoBack()) router.back();
  else goToLogin();
}

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
  const [lastEmail, setLastEmail] = useState('');
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
    if (email) setLastEmail(email);
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
      <AuthScreen
        header={<AuthBackButton onPress={leaveEmailLogin} />}
        footer={<AuthFooterLink index={6} text="Prefere usar senha?" linkLabel="Entrar com senha" onPress={goToLogin} />}
      >
        <AuthIconTile icon={Mail} />
        <AuthHeading
          title="Entrar sem senha"
          subtitle="Enviamos um link e um código de 6 dígitos para o seu e-mail. Use o que for mais prático."
        />
        <Rise index={2}>
          <EmailForm
            submitLabel="Enviar link e código"
            defaultEmail={lastEmail}
            onSubmit={(values) => requestCode(values.email)}
            isSubmitting={requestMutation.isPending}
            errorMessage={requestMutation.isError ? getEmailLoginRequestErrorMessage(requestMutation.error) : null}
          />
        </Rise>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      header={<AuthBackButton onPress={changeEmail} />}
      footer={<AuthFooterLink index={6} text="Prefere usar senha?" linkLabel="Entrar com senha" onPress={goToLogin} />}
    >
      <AuthIconTile icon={Mail} />
      <AuthHeading
        title="Verifique seu e-mail"
        subtitle={
          <>
            Enviamos um código de 6 dígitos para <Text style={authTextStyles.strong}>{email}</Text>
          </>
        }
      />
      <EmailCodeForm
        riseIndex={3}
        onSubmit={(values) => verifyCode(values.code)}
        onResend={resendCode}
        onChangeEmail={changeEmail}
        resendCooldown={cooldown.remaining}
        isSubmitting={verifyMutation.isPending}
        isResending={requestMutation.isPending}
        errorMessage={verifyMutation.isError ? getEmailLoginCodeErrorMessage(verifyMutation.error) : null}
      />
    </AuthScreen>
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
      <AuthScreen footer={<AuthFooterLink index={5} text="Prefere voltar?" linkLabel="Ir para o início" onPress={() => router.replace('/')} />}>
        <AuthIconTile icon={MailX} tone="critical" />
        <AuthHeading title="Não foi possível entrar" subtitle="Solicite um novo código para acessar sua conta." />
        <Rise index={2}>
          <FormError message={getEmailLoginLinkErrorMessage(error)} />
        </Rise>
        <Rise index={3} style={styles.actions}>
          <Button label="Entrar com código" size="lg" block haptic onPress={onUseCode} />
          <Button label="Entrar com senha" variant="secondary" size="lg" block onPress={goToLogin} />
        </Rise>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <AuthIconTile icon={Mail} />
      <AuthHeading title="Entrando na sua conta" subtitle="Aguarde só um instante." />
      <ActivityIndicator accessibilityLabel="Entrando" color={colors.accent} size="large" style={styles.spinner} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
    marginTop: 8,
  },
  spinner: {
    marginTop: 24,
  },
});
