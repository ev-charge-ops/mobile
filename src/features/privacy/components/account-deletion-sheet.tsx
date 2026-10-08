import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { InfoBanner } from '@/components/ui/info-banner';
import { PasswordField } from '@/components/ui/password-field';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import {
  accountDeletionErrorMessages,
  canDeleteAccount,
  getAccountDeletionError,
} from '@/features/privacy/account-deletion';
import { ACCOUNT_DELETION_CONFIRMATION } from '@/features/privacy/api/privacy-api';
import { useDeleteMyAccount } from '@/features/privacy/api/use-privacy';

export type AccountDeletionSheetProps = {
  visible: boolean;
  hasPassword: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

const consequences = [
  'Seu nome e e-mail são apagados e a conta não pode ser recuperada.',
  'Os acessos com Google e Apple são desvinculados e você sai de todos os aparelhos.',
  'As recargas continuam no histórico do condomínio, sob um nome anônimo, pelo prazo exigido em lei.',
];

export function AccountDeletionSheet({ visible, hasPassword, onClose, onDeleted }: AccountDeletionSheetProps) {
  const deleteAccount = useDeleteMyAccount();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const error = deleteAccount.isError ? getAccountDeletionError(deleteAccount.error) : null;
  const canSubmit = canDeleteAccount({ confirmation, password, hasPassword });

  const close = () => {
    deleteAccount.reset();
    setPassword('');
    setConfirmation('');
    onClose();
  };

  const confirm = () => {
    if (!canSubmit) return;
    deleteAccount.mutate(hasPassword ? password : undefined, { onSuccess: onDeleted });
  };

  return (
    <Sheet visible={visible} onClose={close}>
      <View style={styles.content}>
        <View>
          <Text accessibilityRole="header" style={typography.heading}>
            Excluir conta
          </Text>
          <Text style={styles.subtitle}>A exclusão é imediata. Veja o que acontece:</Text>
        </View>
        <View style={styles.consequences}>
          {consequences.map((item) => (
            <View key={item} style={styles.consequence}>
              <View style={styles.bullet} />
              <Text style={styles.consequenceText}>{item}</Text>
            </View>
          ))}
        </View>
        <InfoBanner tone="warning">
          Encerre recargas em andamento antes de excluir. Esta ação não pode ser desfeita.
        </InfoBanner>
        {hasPassword ? (
          <PasswordField
            label="Senha atual"
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            autoComplete="current-password"
            textContentType="password"
            error={error === 'password' ? accountDeletionErrorMessages.password : undefined}
          />
        ) : null}
        <TextField
          label={`Digite ${ACCOUNT_DELETION_CONFIRMATION} para confirmar`}
          placeholder={ACCOUNT_DELETION_CONFIRMATION}
          value={confirmation}
          onChangeText={setConfirmation}
          autoCapitalize="characters"
          autoCorrect={false}
          error={error === 'confirmation' ? accountDeletionErrorMessages.confirmation : undefined}
        />
        {error && error !== 'password' && error !== 'confirmation' ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {accountDeletionErrorMessages[error]}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <Button
            label="Excluir minha conta"
            variant="danger"
            icon={Trash2}
            size="lg"
            block
            haptic="warning"
            disabled={!canSubmit}
            loading={deleteAccount.isPending}
            onPress={confirm}
          />
          <Button label="Cancelar" variant="ghost" block onPress={close} />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: spacing.xs,
  },
  consequences: {
    gap: spacing.sm,
  },
  consequence: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    backgroundColor: colors.criticalText,
  },
  consequenceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textBody,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.semibold,
    color: colors.statusFault,
  },
  actions: {
    gap: spacing.sm,
  },
});
