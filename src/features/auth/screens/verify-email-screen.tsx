import { router, useLocalSearchParams } from 'expo-router';
import { Mail, MailCheck, MailX } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { Rise } from '@/components/ui/rise';
import { colors } from '@/constants/theme';
import { useConfirmEmailVerification } from '@/features/auth/api/use-confirm-email-verification';
import { getVerifyEmailErrorMessage } from '@/features/auth/auth-errors';
import { AuthHeading, AuthIconTile, AuthNote, AuthScreen } from '@/features/auth/components/auth-screen';
import { FormError } from '@/features/auth/components/form-error';

export function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { mutate, isSuccess, isError, error } = useConfirmEmailVerification();
  const requestedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token || requestedTokenRef.current === token) return;
    requestedTokenRef.current = token;
    mutate(token);
  }, [token, mutate]);

  const continueButton = (
    <Rise index={4}>
      <Button label="Continuar" size="lg" block haptic onPress={() => router.replace('/')} />
    </Rise>
  );

  if (!token) {
    return (
      <AuthScreen footer={continueButton}>
        <AuthIconTile icon={MailX} tone="critical" />
        <AuthHeading title="Link inválido" subtitle="Este link de verificação está incompleto. Solicite um novo e-mail." />
        <AuthNote index={2}>Você pode pedir um novo link na aba Conta, no aviso de e-mail não confirmado.</AuthNote>
      </AuthScreen>
    );
  }

  if (isSuccess) {
    return (
      <AuthScreen footer={continueButton}>
        <AuthIconTile icon={MailCheck} tone="energy" />
        <AuthHeading title="E-mail confirmado" subtitle="Tudo certo! Seu e-mail foi verificado com sucesso." />
      </AuthScreen>
    );
  }

  if (isError) {
    return (
      <AuthScreen footer={continueButton}>
        <AuthIconTile icon={MailX} tone="critical" />
        <AuthHeading
          title="Não foi possível confirmar"
          subtitle="Tente abrir o link novamente ou solicite um novo e-mail."
        />
        <Rise index={2}>
          <FormError message={getVerifyEmailErrorMessage(error)} />
        </Rise>
        <AuthNote index={3}>O link de confirmação vale por 24 horas e só pode ser usado uma vez.</AuthNote>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <AuthIconTile icon={Mail} />
      <AuthHeading title="Confirmando seu e-mail" subtitle="Aguarde só um instante." />
      <ActivityIndicator accessibilityLabel="Confirmando" color={colors.accent} size="large" style={styles.spinner} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 24,
  },
});
