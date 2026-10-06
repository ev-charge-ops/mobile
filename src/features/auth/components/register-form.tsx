import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { InfoBanner } from '@/components/ui/info-banner';
import { Rise } from '@/components/ui/rise';
import { TextField } from '@/components/ui/text-field';
import { registerSchema, type RegisterValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';
import { NewPasswordFields } from '@/features/auth/components/new-password-fields';
import { TermsCheckbox } from '@/features/auth/components/terms-checkbox';

export type RegisterFormProps = {
  onSubmit: (values: RegisterValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  riseIndex?: number;
};

export function RegisterForm({ onSubmit, isSubmitting = false, errorMessage, riseIndex = 0 }: RegisterFormProps) {
  const { control, handleSubmit } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', acceptTerms: false },
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
              label="Nome completo"
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
      <Rise index={riseIndex + 1}>
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
      <NewPasswordFields
        control={control}
        passwordLabel="Senha"
        confirmLabel="Confirmar senha"
        onSubmitEditing={submit}
        riseIndex={riseIndex + 2}
      />
      <Rise index={riseIndex + 4}>
        <Controller
          control={control}
          name="acceptTerms"
          render={({ field, fieldState }) => (
            <TermsCheckbox checked={field.value} onChange={field.onChange} error={fieldState.error?.message} />
          )}
        />
      </Rise>
      <Rise index={riseIndex + 5}>
        <InfoBanner>
          O acesso aos pontos de um condomínio depende de convite do síndico. Use o mesmo e-mail em que recebeu o
          convite.
        </InfoBanner>
      </Rise>
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Rise index={riseIndex + 6} style={styles.submit}>
        <Button label="Continuar" size="lg" block haptic loading={isSubmitting} onPress={submit} />
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
