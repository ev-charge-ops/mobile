import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, radii } from '@/constants/theme';
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
      <View style={styles.row}>
        {isGoogleAvailable ? (
          <OAuthPill
            label="Google"
            accessibilityLabel="Continuar com o Google"
            logo={<GoogleLogo />}
            loading={googleLogin.isPending}
            disabled={appleLogin.isPending}
            onPress={() => googleLogin.mutate(undefined, { onError: showError('google') })}
          />
        ) : null}
        {isAppleAvailable ? (
          <OAuthPill
            label="Apple"
            accessibilityLabel="Continuar com a Apple"
            logo={<AppleLogo color={googleLogin.isPending ? colors.textDisabled : colors.textTitle} />}
            loading={appleLogin.isPending}
            disabled={googleLogin.isPending}
            onPress={() => appleLogin.mutate(undefined, { onError: showError('apple') })}
          />
        ) : null}
      </View>
    </View>
  );
}

type OAuthPillProps = {
  label: string;
  accessibilityLabel: string;
  logo: ReactNode;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
};

function OAuthPill({ label, accessibilityLabel, logo, loading, disabled, onPress }: OAuthPillProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      haptic
      onPress={onPress}
      style={styles.pill}
    >
      {loading ? <ActivityIndicator size="small" color={colors.textTitle} /> : logo}
      <Text style={[styles.pillLabel, isDisabled && styles.pillLabelDisabled]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  dividerLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: radii.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceCard,
  },
  pillLabel: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  pillLabelDisabled: {
    color: colors.textDisabled,
  },
});
