import { Clock } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ListRow } from '@/components/ui/list-row';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import type { ChargePoint } from '@/features/charging/api/charging-api';
import { useJoinQueue } from '@/features/charging/api/use-charge-points';
import { chargePointStatusLabels } from '@/features/charging/charging-format';
import {
  formatPosition,
  getQueueErrorMessage,
  QUEUE_RESERVATION_MINUTES,
} from '@/features/charging/charge-point-queue';

export type JoinQueueSheetProps = {
  chargePoint: ChargePoint;
  visible: boolean;
  onClose: () => void;
};

export function JoinQueueSheet({ chargePoint, visible, onClose }: JoinQueueSheetProps) {
  const toast = useToast();
  const joinQueue = useJoinQueue(chargePoint.id);
  const expectedPosition = chargePoint.queueLength + 1;

  const confirm = () => {
    joinQueue.mutate(undefined, {
      onSuccess: (entry) => {
        onClose();
        toast.show(`Você está ${formatPosition(entry.position ?? expectedPosition)} na fila deste ponto.`);
      },
      onError: (error) => {
        onClose();
        toast.show(getQueueErrorMessage(error), { tone: 'error' });
      },
    });
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <View>
          <Text accessibilityRole="header" style={typography.heading}>
            Entrar na fila
          </Text>
          <Text style={styles.subtitle}>
            Você fica em {formatPosition(expectedPosition)} lugar. Avisamos quando o ponto liberar e a vez fica reservada
            por {QUEUE_RESERVATION_MINUTES} minutos para você iniciar a recarga.
          </Text>
        </View>
        <Card padding={0} style={styles.inset}>
          <ListRow label="Situação do ponto" value={chargePointStatusLabels[chargePoint.status]} />
          <ListRow label="Pessoas na fila" value={String(chargePoint.queueLength)} />
          <ListRow label="Sua posição" value={formatPosition(expectedPosition)} />
          <ListRow
            label="Reserva quando liberar"
            value={`${QUEUE_RESERVATION_MINUTES} min`}
            hint="Se não iniciar a tempo, a vez passa para o próximo"
          />
          <ListRow label="Custo de reservar" value="sem custo" divider={false} />
        </Card>
        <Button
          label="Confirmar lugar na fila"
          icon={Clock}
          size="lg"
          block
          haptic
          loading={joinQueue.isPending}
          onPress={confirm}
        />
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
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: spacing.xs,
  },
  inset: {
    backgroundColor: colors.surfaceCard,
  },
});
