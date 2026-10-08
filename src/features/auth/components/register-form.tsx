import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { InfoBanner } from '@/components/ui/info-banner';
import { PasswordField } from '@/components/ui/password-field';
import { Rise } from '@/components/ui/rise';
import { TextField } from '@/components/ui/text-field';
import { registerSchema, type RegisterValues } from '@/features/auth/auth-schemas';
import { FieldLabel } from '@/features/auth/components/field-label';
import { FormError } from '@/features/auth/components/form-error';
import { PasswordStrengthLabel, PasswordStrengthMeter } from '@/features/auth/components/password-strength-meter';
import { TermsCheckbox } from '@/features/auth/components/terms-checkbox';
import { getPasswordStrength } from '@/features/auth/password-strength';

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
  const password = useWatch({ control, name: 'password' });
  const strength = getPasswordStrength(password);

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
      <Rise index={riseIndex + 2}>
        <FieldLabel label="Senha" trailing={<PasswordStrengthLabel strength={strength} />} />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordField
              icon={null}
              accessibilityLabel="Senha"
              placeholder="Crie uma senha"
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
        <PasswordStrengthMeter strength={strength} />
      </Rise>
      <Rise index={riseIndex + 3}>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <PasswordField
              icon={null}
              label="Confirmar senha"
              placeholder="Repita a senha"
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
      </Rise>
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
