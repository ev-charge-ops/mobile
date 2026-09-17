import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, type LucideIcon } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { spacing } from '@/constants/theme';
import { emailSchema, type EmailValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';

export type EmailFormProps = {
  submitLabel: string;
  submitIcon: LucideIcon;
  onSubmit: (values: EmailValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function EmailForm({
  submitLabel,
  submitIcon,
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: EmailFormProps) {
  const { control, handleSubmit } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
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
      <Button label={submitLabel} icon={submitIcon} size="lg" block loading={isSubmitting} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
});
