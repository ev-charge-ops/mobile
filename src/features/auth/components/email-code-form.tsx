import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, LogIn, RotateCw } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { spacing } from '@/constants/theme';
import { emailCodeSchema, type EmailCodeValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';

export const EMAIL_CODE_LENGTH = 6;

export function sanitizeEmailCode(value: string) {
  return value.replace(/\D/g, '').slice(0, EMAIL_CODE_LENGTH);
}

export type EmailCodeFormProps = {
  onSubmit: (values: EmailCodeValues) => void;
  onResend: () => void;
  resendCooldown?: number;
  isSubmitting?: boolean;
  isResending?: boolean;
  errorMessage?: string | null;
};

export function EmailCodeForm({
  onSubmit,
  onResend,
  resendCooldown = 0,
  isSubmitting = false,
  isResending = false,
  errorMessage,
}: EmailCodeFormProps) {
  const { control, handleSubmit } = useForm<EmailCodeValues>({
    resolver: zodResolver(emailCodeSchema),
    defaultValues: { code: '' },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="code"
        render={({ field, fieldState }) => (
          <TextField
            label="Código"
            icon={KeyRound}
            placeholder="000000"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            returnKeyType="go"
            autoFocus
            value={field.value}
            onChangeText={(text) => {
              const code = sanitizeEmailCode(text);
              field.onChange(code);
              if (code.length === EMAIL_CODE_LENGTH && !isSubmitting) void submit();
            }}
            onBlur={field.onBlur}
            onSubmitEditing={submit}
            error={fieldState.error?.message}
          />
        )}
      />
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Button label="Entrar" icon={LogIn} size="lg" block loading={isSubmitting} onPress={submit} />
      <Button
        label={resendCooldown > 0 ? `Reenviar código em ${resendCooldown} s` : 'Reenviar código'}
        icon={RotateCw}
        variant="ghost"
        block
        disabled={resendCooldown > 0}
        loading={isResending}
        onPress={onResend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
});
