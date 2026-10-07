import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, User, UserPlus } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { spacing } from '@/constants/theme';
import { acceptInviteSchema, type AcceptInviteValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';

export type InviteAccountFormProps = {
  onSubmit: (values: AcceptInviteValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function InviteAccountForm({ onSubmit, isSubmitting = false, errorMessage }: InviteAccountFormProps) {
  const { control, handleSubmit } = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { name: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            label="Nome"
            icon={User}
            placeholder="Como devemos te chamar?"
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
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            label="Senha"
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
            label="Confirmar senha"
            icon={Lock}
            placeholder="Repita a senha"
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
      <Button label="Criar conta e aceitar" icon={UserPlus} size="lg" block loading={isSubmitting} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
});
