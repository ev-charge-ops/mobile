import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Rise } from '@/components/ui/rise';
import { colors } from '@/constants/theme';
import { useLogin } from '@/features/auth/api/use-login';
import { getLoginErrorMessage } from '@/features/auth/auth-errors';
import { AuthHero } from '@/features/auth/components/auth-hero';
import { AuthFooterLink, AuthHeading } from '@/features/auth/components/auth-screen';
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
            <AuthHeading title="Entrar" subtitle="Use o e-mail cadastrado no condomínio." />
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
          <View style={styles.footer}>
            <AuthFooterLink
              index={7}
              text="Ainda não tem conta?"
              linkLabel="Criar conta"
              onPress={() => router.replace('/register')}
            />
          </View>
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
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    paddingHorizontal: 20,
  },
});
