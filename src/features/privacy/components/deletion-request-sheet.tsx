import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { InfoBanner } from '@/components/ui/info-banner';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { useRequestAccountDeletion } from '@/features/privacy/api/use-privacy';

const MAX_REASON_LENGTH = 500;

export type DeletionRequestSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function DeletionRequestSheet({ visible, onClose }: DeletionRequestSheetProps) {
  const toast = useToast();
  const requestDeletion = useRequestAccountDeletion();
  const [reason, setReason] = useState('');

  const close = () => {
    requestDeletion.reset();
    onClose();
  };

  const confirm = () => {
    const trimmed = reason.trim();
    requestDeletion.mutate(trimmed.length > 0 ? trimmed : undefined, {
      onSuccess: () => {
        setReason('');
        close();
        toast.show('Pedido de exclusão registrado. Avisaremos por e-mail quando concluir.');
      },
    });
  };

  return (
    <Sheet visible={visible} onClose={close}>
      <View style={styles.content}>
        <View>
          <Text accessibilityRole="header" style={typography.heading}>
            Solicitar exclusão da conta
          </Text>
          <Text style={styles.subtitle}>
            Seus dados pessoais serão eliminados. Registros de cobrança ficam guardados pelo prazo legal.
          </Text>
        </View>
        <InfoBanner tone="warning">
          Recargas em andamento e cobranças pendentes precisam ser concluídas antes da exclusão.
        </InfoBanner>
        <TextField
          label="Motivo (opcional)"
          placeholder="Conte por que está saindo"
          value={reason}
          onChangeText={setReason}
          autoCapitalize="sentences"
          maxLength={MAX_REASON_LENGTH}
          multiline
        />
        {requestDeletion.isError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            Não foi possível registrar o pedido. Tente novamente.
          </Text>
        ) : null}
        <View style={styles.actions}>
          <Button
            label="Confirmar exclusão"
            variant="danger"
            icon={Trash2}
            size="lg"
            block
            haptic="warning"
            loading={requestDeletion.isPending}
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
  error: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.statusFault,
  },
  actions: {
    gap: spacing.sm,
  },
});
