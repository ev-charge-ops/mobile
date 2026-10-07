import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useAppleLogin, useGoogleLogin } from '@/features/auth/api/use-oauth-login';
import { getOAuthLoginErrorMessage, type OAuthProvider } from '@/features/auth/auth-errors';
import { isAppleSignInAvailable } from '@/features/auth/oauth/apple-sign-in';
import { isGoogleSignInAvailable } from '@/features/auth/oauth/google-sign-in';

export function OAuthButtons() {
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isGoogleAvailable] = useState(isGoogleSignInAvailable);
  const googleLogin = useGoogleLogin();
  const appleLogin = useAppleLogin();
  const toast = useToast();
  const isBusy = googleLogin.isPending || appleLogin.isPending;

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
      {isAppleAvailable ? (
        <AppleAuthentication.AppleAuthenticationButton
          accessibilityLabel="Continuar com a Apple"
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={radii.card}
          style={styles.appleButton}
          onPress={() => {
            if (!isBusy) appleLogin.mutate(undefined, { onError: showError('apple') });
          }}
        />
      ) : null}
      {isGoogleAvailable ? (
        <Button
          label="Continuar com o Google"
          variant="secondary"
          size="lg"
          block
          loading={googleLogin.isPending}
          disabled={appleLogin.isPending}
          onPress={() => googleLogin.mutate(undefined, { onError: showError('google') })}
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
  appleButton: {
    width: '100%',
    height: 52,
  },
});
