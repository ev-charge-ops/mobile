import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { colors, spacing, typography } from '@/constants/theme';
import type { AuthSession } from '@/features/auth/api/auth-api';
import { useAppleLogin, useGoogleLogin } from '@/features/auth/api/use-oauth-login';
import { getOAuthLoginErrorMessage, type OAuthProvider } from '@/features/auth/auth-errors';
import { AppleLogo, GoogleLogo } from '@/features/auth/components/oauth-logos';
import { isAppleSignInAvailable } from '@/features/auth/oauth/apple-sign-in';
import { isGoogleSignInAvailable } from '@/features/auth/oauth/google-sign-in';

export type OAuthButtonsProps = {
  onSignedIn?: (session: AuthSession) => void;
};

export function OAuthButtons({ onSignedIn }: OAuthButtonsProps = {}) {
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isGoogleAvailable] = useState(isGoogleSignInAvailable);
  const googleLogin = useGoogleLogin({ onSignedIn });
  const appleLogin = useAppleLogin({ onSignedIn });
  const toast = useToast();

  useEffect(() => {
    let active = true;
    void isAppleSignInAvailable().then((available) => {
      if (active) setIsAppleAvailable(available);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!isAppleAvailable && !isGoogleAvailable) return null;

  const showError = (provider: OAuthProvider) => (error: unknown) =>
    toast.show(getOAuthLoginErrorMessage(provider, error), { tone: 'error' });

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerLabel}>ou</Text>
        <View style={styles.line} />
      </View>
      {isGoogleAvailable ? (
        <Button
          label="Continuar com o Google"
          variant="outline"
          size="lg"
          block
          leadingIcon={<GoogleLogo />}
          loading={googleLogin.isPending}
          disabled={appleLogin.isPending}
          onPress={() => googleLogin.mutate(undefined, { onError: showError('google') })}
        />
      ) : null}
      {isAppleAvailable ? (
        <Button
          label="Continuar com a Apple"
          variant="outline"
          size="lg"
          block
          leadingIcon={<AppleLogo color={googleLogin.isPending ? colors.textDisabled : colors.textTitle} />}
          loading={appleLogin.isPending}
          disabled={googleLogin.isPending}
          onPress={() => appleLogin.mutate(undefined, { onError: showError('apple') })}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.hairline,
  },
  dividerLabel: {
    ...typography.label,
    color: colors.textSubtle,
  },
});
