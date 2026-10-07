import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Lock } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { spacing } from '@/constants/theme';
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';

export type ResetPasswordFormProps = {
  onSubmit: (values: ResetPasswordValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function ResetPasswordForm({ onSubmit, isSubmitting = false, errorMessage }: ResetPasswordFormProps) {
  const { control, handleSubmit } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            label="Nova senha"
            icon={Lock}
            placeholder="Mínimo de 8 caracteres"
            secureTextEntry
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
          <TextField
            label="Confirmar nova senha"
            icon={Lock}
            placeholder="Repita a nova senha"
            secureTextEntry
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
      <Button label="Redefinir senha" icon={KeyRound} size="lg" block loading={isSubmitting} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
});
