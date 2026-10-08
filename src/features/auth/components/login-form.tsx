import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/password-field';
import { Rise } from '@/components/ui/rise';
import { TextField } from '@/components/ui/text-field';
import { colors, fonts } from '@/constants/theme';
import { loginSchema, type LoginValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';

export type LoginFormProps = {
  onSubmit: (values: LoginValues) => void;
  onForgotPassword?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  riseIndex?: number;
};

export function LoginForm({ onSubmit, onForgotPassword, isSubmitting = false, errorMessage, riseIndex = 0 }: LoginFormProps) {
  const { control, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      <Rise index={riseIndex}>
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
              returnKeyType="next"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      </Rise>
      <Rise index={riseIndex + 1}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Senha</Text>
          {onForgotPassword ? (
            <Pressable accessibilityRole="link" hitSlop={10} onPress={onForgotPassword}>
              <Text style={styles.forgot}>Esqueci a senha</Text>
            </Pressable>
          ) : null}
        </View>
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordField
              icon={null}
              accessibilityLabel="Senha"
              placeholder="Sua senha"
              autoComplete="current-password"
              textContentType="password"
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
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Rise index={riseIndex + 2} style={styles.submit}>
        <Button label="Entrar" size="lg" block haptic loading={isSubmitting} onPress={submit} />
      </Rise>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.textBody,
  },
  forgot: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  submit: {
    marginTop: 4,
  },
});
