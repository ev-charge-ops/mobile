import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Rise } from '@/components/ui/rise';
import { colors, fonts } from '@/constants/theme';
import { emailCodeSchema, type EmailCodeValues } from '@/features/auth/auth-schemas';
import { AuthNote } from '@/features/auth/components/auth-screen';
import { CodeInput } from '@/features/auth/components/code-input';
import { FormError } from '@/features/auth/components/form-error';

export const EMAIL_CODE_LENGTH = 6;

export function sanitizeEmailCode(value: string) {
  return value.replace(/\D/g, '').slice(0, EMAIL_CODE_LENGTH);
}

export function formatCountdown(seconds: number) {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export type EmailCodeFormProps = {
  onSubmit: (values: EmailCodeValues) => void;
  onResend: () => void;
  onChangeEmail?: () => void;
  resendCooldown?: number;
  isSubmitting?: boolean;
  isResending?: boolean;
  errorMessage?: string | null;
  riseIndex?: number;
};

export function EmailCodeForm({
  onSubmit,
  onResend,
  onChangeEmail,
  resendCooldown = 0,
  isSubmitting = false,
  isResending = false,
  errorMessage,
  riseIndex = 0,
}: EmailCodeFormProps) {
  const { control, handleSubmit } = useForm<EmailCodeValues>({
    resolver: zodResolver(emailCodeSchema),
    defaultValues: { code: '' },
  });

  const submit = handleSubmit(onSubmit);
  const isCoolingDown = resendCooldown > 0;
  const resendLabel = isCoolingDown ? `Reenviar código em ${formatCountdown(resendCooldown)}` : 'Reenviar código';

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="code"
        render={({ field, fieldState }) => (
          <CodeInput
            length={EMAIL_CODE_LENGTH}
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
      <Rise index={riseIndex} style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={resendLabel}
          accessibilityState={{ disabled: isCoolingDown || isResending, busy: isResending }}
          disabled={isCoolingDown || isResending}
          hitSlop={6}
          onPress={onResend}
          style={styles.action}
        >
          {isResending ? <ActivityIndicator size="small" color={colors.textTitle} /> : null}
          {isCoolingDown ? (
            <Text style={styles.waiting}>
              Reenviar código em <Text style={styles.countdown}>{formatCountdown(resendCooldown)}</Text>
            </Text>
          ) : (
            <Text style={[styles.link, isResending && styles.linkDisabled]}>Reenviar código</Text>
          )}
        </Pressable>
        {onChangeEmail ? (
          <Pressable accessibilityRole="button" hitSlop={6} onPress={onChangeEmail} style={styles.action}>
            <Text style={styles.link}>Trocar e-mail</Text>
          </Pressable>
        ) : null}
      </Rise>
      <AuthNote index={riseIndex + 1}>
        O código vale por 10 minutos. Se não encontrar a mensagem, confira a caixa de spam ou promoções.
      </AuthNote>
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Rise index={riseIndex + 2} style={styles.submit}>
        <Button label="Confirmar" size="lg" block haptic loading={isSubmitting} onPress={submit} />
      </Rise>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  action: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waiting: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  countdown: {
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
    color: colors.textTitle,
  },
  link: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  linkDisabled: {
    color: colors.textDisabled,
  },
  submit: {
    marginTop: 12,
  },
});
