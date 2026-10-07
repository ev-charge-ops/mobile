import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { colors, spacing } from '@/constants/theme';
import { useConfirmEmailVerification } from '@/features/auth/api/use-confirm-email-verification';
import { getVerifyEmailErrorMessage } from '@/features/auth/auth-errors';
import { AuthLayout } from '@/features/auth/components/auth-layout';
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
    <Button label="Continuar" icon={ArrowRight} size="lg" block onPress={() => router.replace('/')} />
  );

  if (!token) {
    return (
      <AuthLayout title="Link inválido" subtitle="Este link de verificação está incompleto. Solicite um novo e-mail.">
        {continueButton}
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="E-mail confirmado" subtitle="Tudo certo! Seu e-mail foi verificado com sucesso.">
        {continueButton}
      </AuthLayout>
    );
  }

  if (isError) {
    return (
      <AuthLayout title="Não foi possível confirmar" subtitle="Tente abrir o link novamente ou solicite um novo e-mail.">
        <View style={styles.stack}>
          <FormError message={getVerifyEmailErrorMessage(error)} />
          {continueButton}
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Confirmando seu e-mail" subtitle="Aguarde só um instante.">
      <ActivityIndicator accessibilityLabel="Confirmando" color={colors.accent} size="large" />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
});
