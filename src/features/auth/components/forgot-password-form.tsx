import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Send } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { spacing } from '@/constants/theme';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';

export type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function ForgotPasswordForm({ onSubmit, isSubmitting = false, errorMessage }: ForgotPasswordFormProps) {
  const { control, handleSubmit } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label="E-mail"
            icon={Mail}
            placeholder="voce@exemplo.com"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={submit}
            error={fieldState.error?.message}
          />
        )}
      />
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Button label="Enviar link" icon={Send} size="lg" block loading={isSubmitting} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
});
