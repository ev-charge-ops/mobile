import { zodResolver } from '@hookform/resolvers/zod';
import type { LucideIcon } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { colors, fonts } from '@/constants/theme';
import { emailSchema, type EmailValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';

export type EmailFormProps = {
  submitLabel: string;
  submitIcon?: LucideIcon;
  defaultEmail?: string;
  note?: string;
  onSubmit: (values: EmailValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function EmailForm({
  submitLabel,
  submitIcon,
  defaultEmail = '',
  note,
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: EmailFormProps) {
  const { control, handleSubmit } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: defaultEmail },
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
      {note ? <Text style={styles.note}>{note}</Text> : null}
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Button label={submitLabel} icon={submitIcon} size="lg" block haptic loading={isSubmitting} onPress={submit} style={styles.submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  submit: {
    marginTop: 8,
  },
  note: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});
