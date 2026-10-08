import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Rise } from '@/components/ui/rise';
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';
import { NewPasswordFields } from '@/features/auth/components/new-password-fields';

export type ResetPasswordFormProps = {
  onSubmit: (values: ResetPasswordValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  riseIndex?: number;
};

export function ResetPasswordForm({
  onSubmit,
  isSubmitting = false,
  errorMessage,
  riseIndex = 0,
}: ResetPasswordFormProps) {
  const { control, handleSubmit } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      <NewPasswordFields
        control={control}
        passwordLabel="Nova senha"
        confirmLabel="Confirmar nova senha"
        passwordPlaceholder="Crie uma nova senha"
        confirmPlaceholder="Repita a nova senha"
        onSubmitEditing={submit}
        riseIndex={riseIndex}
      />
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Rise index={riseIndex + 2} style={styles.submit}>
        <Button label="Redefinir senha" size="lg" block haptic loading={isSubmitting} onPress={submit} />
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
