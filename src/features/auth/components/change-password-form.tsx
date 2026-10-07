import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/password-field';
import { spacing } from '@/constants/theme';
import { createChangePasswordSchema, type ChangePasswordValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';

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

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      {requiresCurrentPassword ? (
        <Controller
          control={control}
          name="currentPassword"
          render={({ field, fieldState }) => (
            <PasswordField
              label="Senha atual"
              required
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
      ) : null}
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordField
            label="Nova senha"
            required
            placeholder="Mínimo de 8 caracteres"
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
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <PasswordField
            label="Confirmar nova senha"
            required
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
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Button
        label={requiresCurrentPassword ? 'Alterar senha' : 'Criar senha'}
        icon={KeyRound}
        size="lg"
        block
        haptic="success"
        loading={isSubmitting}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
});
