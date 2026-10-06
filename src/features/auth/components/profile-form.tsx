import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, CircleAlert, CircleCheck } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Rise } from '@/components/ui/rise';
import { TextField } from '@/components/ui/text-field';
import { colors, fonts } from '@/constants/theme';
import { profileSchema, type ProfileValues } from '@/features/auth/auth-schemas';
import { FormError } from '@/features/auth/components/form-error';

export type ProfileFormProps = {
  name: string;
  email: string;
  emailVerified: boolean;
  membership?: string | null;
  onSubmit: (values: ProfileValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export function ProfileForm({
  name,
  email,
  emailVerified,
  membership,
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: ProfileFormProps) {
  const { control, handleSubmit, formState } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      <Rise index={2}>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              label="Nome"
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
      </Rise>
      <Rise index={3}>
        <TextField
          label="E-mail"
          value={email}
          editable={false}
          hint="O e-mail é usado para entrar na sua conta e ainda não pode ser alterado pelo app."
          trailing={<EmailStatusChip verified={emailVerified} />}
        />
      </Rise>
      {membership ? (
        <Rise index={4} style={styles.membership}>
          <View style={styles.membershipIcon}>
            <Icon icon={Building2} size={18} color={colors.textTitle} />
          </View>
          <View style={styles.membershipTexts}>
            <Text style={styles.membershipTitle}>{membership}</Text>
            <Text style={styles.membershipHint}>Para trocar de unidade, fale com o síndico.</Text>
          </View>
        </Rise>
      ) : null}
      {errorMessage ? <FormError message={errorMessage} /> : null}
      <Rise index={5} style={styles.submit}>
        <Button
          label="Salvar alterações"
          size="xl"
          block
          haptic="success"
          disabled={!formState.isDirty}
          loading={isSubmitting}
          onPress={submit}
        />
      </Rise>
    </View>
  );
}

function EmailStatusChip({ verified }: { verified: boolean }) {
  return (
    <View style={[styles.chip, verified ? styles.chipVerified : styles.chipPending]}>
      <Icon
        icon={verified ? CircleCheck : CircleAlert}
        size={13}
        strokeWidth={2.5}
        color={verified ? colors.energyText : colors.warningText}
      />
      <Text style={[styles.chipText, { color: verified ? colors.energyText : colors.warningText }]}>
        {verified ? 'verificado' : 'não verificado'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginRight: -6,
  },
  chipVerified: {
    backgroundColor: colors.energyTint,
  },
  chipPending: {
    backgroundColor: colors.warningTint,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.bold,
  },
  membership: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceInset,
  },
  membershipIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCard,
  },
  membershipTexts: {
    flex: 1,
    gap: 4,
  },
  membershipTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  membershipHint: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  submit: {
    marginTop: 12,
  },
});
