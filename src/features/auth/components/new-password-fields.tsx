import { Controller, useWatch, type Control, type FieldValues, type Path } from 'react-hook-form';

import { PasswordField } from '@/components/ui/password-field';
import { Rise } from '@/components/ui/rise';
import { FieldLabel } from '@/features/auth/components/field-label';
import { PasswordStrengthLabel, PasswordStrengthMeter } from '@/features/auth/components/password-strength-meter';
import { getPasswordStrength } from '@/features/auth/password-strength';

type NewPasswordValues = FieldValues & { password: string; confirmPassword: string };

export type NewPasswordFieldsProps<T extends NewPasswordValues> = {
  control: Control<T>;
  passwordLabel: string;
  confirmLabel: string;
  passwordPlaceholder?: string;
  confirmPlaceholder?: string;
  onSubmitEditing: () => void;
  riseIndex?: number;
};

export function NewPasswordFields<T extends NewPasswordValues>({
  control,
  passwordLabel,
  confirmLabel,
  passwordPlaceholder = 'Crie uma senha',
  confirmPlaceholder = 'Repita a senha',
  onSubmitEditing,
  riseIndex = 0,
}: NewPasswordFieldsProps<T>) {
  const password = useWatch({ control, name: 'password' as Path<T> }) as string;
  const strength = getPasswordStrength(password ?? '');

  return (
    <>
      <Rise index={riseIndex}>
        <FieldLabel label={passwordLabel} trailing={<PasswordStrengthLabel strength={strength} />} />
        <Controller
          control={control}
          name={'password' as Path<T>}
          render={({ field, fieldState }) => (
            <PasswordField
              icon={null}
              accessibilityLabel={passwordLabel}
              placeholder={passwordPlaceholder}
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
      <Rise index={riseIndex + 1}>
        <Controller
          control={control}
          name={'confirmPassword' as Path<T>}
          render={({ field, fieldState }) => (
            <PasswordField
              icon={null}
              label={confirmLabel}
              placeholder={confirmPlaceholder}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={onSubmitEditing}
              error={fieldState.error?.message}
            />
          )}
        />
      </Rise>
    </>
  );
}
