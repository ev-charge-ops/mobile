import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { FadeInItem } from '@/components/ui/fade-in-item';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, spacing } from '@/constants/theme';
import { useChangePassword } from '@/features/auth/api/use-change-password';
import { getChangePasswordErrorMessage } from '@/features/auth/auth-errors';
import type { ChangePasswordValues } from '@/features/auth/auth-schemas';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';

export type ChangePasswordScreenProps = {
  hasPassword: boolean;
  onBack: () => void;
  onDone: () => void;
};

export function ChangePasswordScreen({ hasPassword, onBack, onDone }: ChangePasswordScreenProps) {
  const changePassword = useChangePassword();
  const toast = useToast();

  const submit = ({ currentPassword, password }: ChangePasswordValues) =>
    changePassword.mutate(hasPassword ? { currentPassword, newPassword: password } : { newPassword: password }, {
      onSuccess: () => {
        toast.show(hasPassword ? 'Senha alterada' : 'Senha criada');
        onDone();
      },
    });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <AppBar title={hasPassword ? 'Alterar senha' : 'Criar senha'} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FadeInItem>
          <Text style={styles.subtitle}>
            {hasPassword
              ? 'Ao alterar a senha, você continua conectado neste aparelho e os outros dispositivos precisarão entrar novamente.'
              : 'Você entra com Google, Apple ou código por e-mail. Crie uma senha para também entrar com e-mail e senha.'}
          </Text>
        </FadeInItem>
        <FadeInItem index={1}>
          <ChangePasswordForm
            requiresCurrentPassword={hasPassword}
            onSubmit={submit}
            isSubmitting={changePassword.isPending}
            errorMessage={changePassword.isError ? getChangePasswordErrorMessage(changePassword.error) : null}
          />
        </FadeInItem>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    gap: spacing.xl,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
  },
});
