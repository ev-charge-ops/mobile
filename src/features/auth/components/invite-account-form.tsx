import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Rise } from '@/components/ui/rise';
import { TextField } from '@/components/ui/text-field';
import { acceptInviteSchema, type AcceptInviteValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';
import { NewPasswordFields } from '@/features/auth/components/new-password-fields';

export type InviteAccountFormProps = {
  onSubmit: (values: AcceptInviteValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  riseIndex?: number;
};

export function InviteAccountForm({
  onSubmit,
  isSubmitting = false,
  errorMessage,
  riseIndex = 0,
}: InviteAccountFormProps) {
  const { control, handleSubmit } = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { name: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      <Rise index={riseIndex}>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              label="Nome"
              placeholder="Como no documento"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      </Rise>
      <NewPasswordFields
        control={control}
        passwordLabel="Senha"
        confirmLabel="Confirmar senha"
        onSubmitEditing={submit}
        riseIndex={riseIndex + 1}
      />
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Rise index={riseIndex + 3} style={styles.submit}>
        <Button label="Criar conta e aceitar" size="lg" block haptic loading={isSubmitting} onPress={submit} />
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
