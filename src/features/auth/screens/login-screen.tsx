import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Rise } from '@/components/ui/rise';
import { colors, fonts } from '@/constants/theme';
import { useLogin } from '@/features/auth/api/use-login';
import { getLoginErrorMessage } from '@/features/auth/auth-errors';
import { AuthHero } from '@/features/auth/components/auth-hero';
import { AuthTextButton } from '@/features/auth/components/auth-text-button';
import { LoginForm } from '@/features/auth/components/login-form';
import { OAuthButtons } from '@/features/auth/components/oauth-buttons';

export function LoginScreen() {
  const loginMutation = useLogin();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.heroWrap}>
            <AuthHero />
          </View>
          <View style={styles.body}>
            <Rise index={1} style={styles.header}>
              <Text accessibilityRole="header" style={styles.title}>
                Entrar
              </Text>
              <Text style={styles.subtitle}>Use o e-mail cadastrado no condomínio.</Text>
            </Rise>
            <LoginForm
              riseIndex={2}
              onSubmit={(values) => loginMutation.mutate(values)}
              onForgotPassword={() => router.push('/forgot-password')}
              isSubmitting={loginMutation.isPending}
              errorMessage={loginMutation.isError ? getLoginErrorMessage(loginMutation.error) : null}
            />
            <Rise index={5}>
              <OAuthButtons />
            </Rise>
            <Rise index={6}>
              <AuthTextButton label="Receber link por e-mail" icon={Mail} onPress={() => router.push('/login/email')} />
            </Rise>
          </View>
          <Rise index={7} style={styles.footer}>
            <Text style={styles.footerText}>
              Ainda não tem conta?{' '}
              <Text accessibilityRole="link" style={styles.footerLink} onPress={() => router.replace('/register')}>
                Criar conta
              </Text>
            </Text>
          </Rise>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingTop: 11,
    paddingBottom: 26,
  },
  heroWrap: {
    paddingHorizontal: 16,
  },
  body: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    gap: 2,
    marginBottom: 2,
  },
  title: {
    fontSize: 32,
    lineHeight: 35,
    fontFamily: fonts.bold,
    letterSpacing: -0.96,
    color: colors.textTitle,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  footerLink: {
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
});
