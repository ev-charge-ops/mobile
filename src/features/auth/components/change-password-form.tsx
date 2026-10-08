import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { InfoBanner } from '@/components/ui/info-banner';
import { PasswordField } from '@/components/ui/password-field';
import { Rise } from '@/components/ui/rise';
import { createChangePasswordSchema, type ChangePasswordValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';
import {
  PasswordStrengthCard,
  type PasswordChecklistRule,
} from '@/features/auth/components/password-strength-meter';
import { getPasswordStrength } from '@/features/auth/password-strength';

export type ChangePasswordFormProps = {
  requiresCurrentPassword: boolean;
  onSubmit: (values: ChangePasswordValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function ChangePasswordForm({
  requiresCurrentPassword,
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: ChangePasswordFormProps) {
  const { control, handleSubmit } = useForm<ChangePasswordValues>({
    resolver: zodResolver(createChangePasswordSchema(requiresCurrentPassword)),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  });
  const [currentPassword, password, confirmPassword] = useWatch({
    control,
    name: ['currentPassword', 'password', 'confirmPassword'],
  });
  const strength = getPasswordStrength(password);
  const rules: PasswordChecklistRule[] = [
    { label: 'Pelo menos 8 caracteres', met: strength.hasMinLength },
    { label: 'Uma letra maiúscula e uma minúscula', met: strength.hasMixedCase },
    { label: 'Pelo menos um número', met: strength.hasNumber },
    ...(requiresCurrentPassword
      ? [{ label: 'Diferente da senha atual', met: password.length > 0 && password !== currentPassword }]
      : []),
    { label: 'As duas senhas coincidem', met: password.length > 0 && password === confirmPassword },
  ];

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      {requiresCurrentPassword ? (
        <Rise index={1}>
          <Controller
            control={control}
            name="currentPassword"
            render={({ field, fieldState }) => (
              <PasswordField
                icon={null}
                label="Senha atual"
                placeholder="Sua senha atual"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="next"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
        </Rise>
      ) : null}
      <Rise index={2}>
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordField
              icon={null}
              label="Nova senha"
              placeholder="Crie uma senha"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      </Rise>
      <Rise index={3}>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <PasswordField
              icon={null}
              label="Confirmar nova senha"
              placeholder="Repita a nova senha"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={submit}
              error={fieldState.error?.message}
            />
          )}
        />
      </Rise>
      <Rise index={4}>
        <PasswordStrengthCard strength={strength} rules={rules} />
      </Rise>
      <Rise index={5}>
        <InfoBanner>
          {requiresCurrentPassword
            ? 'Você continuará conectado neste aparelho; os outros serão desconectados.'
            : 'Você entra com Google, Apple ou código por e-mail. Crie uma senha para também entrar com e-mail e senha.'}
        </InfoBanner>
      </Rise>
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Rise index={6} style={styles.submit}>
        <Button
          label={requiresCurrentPassword ? 'Atualizar senha' : 'Criar senha'}
          size="xl"
          block
          haptic="success"
          loading={isSubmitting}
          onPress={submit}
        />
      </Rise>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  submit: {
    marginTop: 12,
  },
});
