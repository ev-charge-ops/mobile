import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, LogIn, Mail } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { spacing } from '@/constants/theme';
import { loginSchema, type LoginValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';

export type LoginFormProps = {
  onSubmit: (values: LoginValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function LoginForm({ onSubmit, isSubmitting = false, errorMessage }: LoginFormProps) {
  const { control, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
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
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            label="Senha"
            icon={Lock}
            placeholder="Sua senha"
            secureTextEntry
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
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Button label="Entrar" icon={LogIn} size="lg" block loading={isSubmitting} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
});
