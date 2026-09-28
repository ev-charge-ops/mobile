import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Mail, UserRound } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { spacing } from '@/constants/theme';
import { profileSchema, type ProfileValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';

export type ProfileFormProps = {
  name: string;
  email: string;
  onSubmit: (values: ProfileValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function ProfileForm({ name, email, onSubmit, isSubmitting = false, errorMessage }: ProfileFormProps) {
  const { control, handleSubmit, formState } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name },
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
            required
            icon={UserRound}
            placeholder="Seu nome completo"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="done"
            maxLength={100}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={submit}
            error={fieldState.error?.message}
          />
        )}
      />
      <TextField
        label="E-mail"
        icon={Mail}
        value={email}
        editable={false}
        hint="O e-mail é usado para entrar na sua conta e ainda não pode ser alterado pelo app."
      />
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Button
        label="Salvar alterações"
        icon={Check}
        size="lg"
        block
        haptic="success"
        disabled={!formState.isDirty}
        loading={isSubmitting}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
});
