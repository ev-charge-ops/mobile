import { router } from 'expo-router';
import { CreditCard, House, LogOut, RotateCw, Square, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { ChargingApiError, type ChargingSession } from '@/features/charging/api/charging-api';
import { useChargingSession, usePayForSession, useStopSession } from '@/features/charging/api/use-charging-sessions';
import { getCardPaymentErrorMessage, getStopSessionErrorMessage } from '@/features/charging/charging-errors';
import { formatCents } from '@/features/charging/charging-format';
import { LiveSessionPanel } from '@/features/charging/components/live-session-panel';
import { SessionReceipt } from '@/features/charging/components/session-receipt';
import { isSessionOpen } from '@/features/charging/session-timing';
import { useSessionHaptics } from '@/features/charging/use-session-haptics';
import { useNow } from '@/hooks/use-now';
import { formatEnergy } from '@/utils/format-energy';

export type SessionScreenProps = {
  sessionId: string;
};

const titles: Record<ChargingSession['status'], string> = {
  AWAITING_PAYMENT: 'Pagamento pendente',
  PENDING: 'Liberando carregador',
  ACTIVE: 'Recarga em andamento',
  GRACE: 'Carga concluída',
  IDLE: 'Taxa de ocupação',
  CLOSED: 'Recibo',
  INTERRUPTED: 'Recibo',
};

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function SessionScreen({ sessionId }: SessionScreenProps) {
  const { data: session, isPending, error, refetch, isRefetching } = useChargingSession(sessionId);
  const stopSession = useStopSession(sessionId);
  const payForSession = usePayForSession();
  const toast = useToast();
  const [isConfirmingStop, setConfirmingStop] = useState(false);
  const isOpen = session ? isSessionOpen(session.status) : false;
  const now = useNow(1000, isOpen);
  useSessionHaptics(session?.status);

  const stop = () => {
    setConfirmingStop(false);
    stopSession.mutate(undefined, {
      onSuccess: () => toast.show('Recarga encerrada'),
      onError: (stopError) => {
        toast.show(getStopSessionErrorMessage(stopError), { tone: 'error' });
        if (stopError instanceof ChargingApiError && stopError.code === 'SESSION_ALREADY_ENDED') refetch();
      },
    });
  };

  const pay = () => {
    payForSession.mutate(
      { sessionId },
      {
        onSuccess: (paid) => {
          if (!paid) return;
          if (paid.status === 'AWAITING_PAYMENT') toast.show('O cartão não autorizou o pagamento.', { tone: 'error' });
          else toast.show('Pagamento autorizado. Carregador liberado!');
        },
        onError: (payError) => toast.show(getCardPaymentErrorMessage(payError), { tone: 'error' }),
      },
    );
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
        <AppBar title={session ? titles[session.status] : 'Recarga'} onBack={goBack} />
        {session ? (
          <>
            <ScrollView contentContainerStyle={styles.content}>
              {isOpen ? <LiveSessionPanel session={session} now={now} /> : <SessionReceipt session={session} />}
            </ScrollView>
            <View style={styles.footer}>
              {session.status === 'PENDING' ? (
                <Button
                  label="Cancelar"
                  variant="ghost"
                  size="md"
                  block
                  loading={stopSession.isPending}
                  onPress={stop}
                />
              ) : session.status === 'ACTIVE' ? (
                <Button
                  label="Encerrar recarga"
                  icon={Square}
                  variant="danger"
                  size="lg"
                  block
                  loading={stopSession.isPending}
                  onPress={() => setConfirmingStop(true)}
                />
              ) : session.status === 'AWAITING_PAYMENT' ? (
                <View style={styles.stack}>
                  <Button
                    label="Pagar com cartão"
                    icon={CreditCard}
                    size="lg"
                    block
                    loading={payForSession.isPending}
                    disabled={stopSession.isPending}
                    onPress={pay}
                  />
                  <Button
                    label="Cancelar recarga"
                    icon={X}
                    variant="outline"
                    size="lg"
                    block
                    loading={stopSession.isPending}
                    disabled={payForSession.isPending}
                    onPress={stop}
                  />
                </View>
              ) : isOpen ? (
                <Button
                  label="Retirei o veículo · encerrar"
                  icon={LogOut}
                  variant={session.status === 'IDLE' ? 'danger' : 'primary'}
                  size="lg"
                  block
                  haptic="impactMedium"
                  loading={stopSession.isPending}
                  onPress={stop}
                />
              ) : (
                <Button label="Voltar ao início" icon={House} size="lg" block onPress={() => router.dismissTo('/')} />
              )}
            </View>
          </>
        ) : isPending ? (
          <View style={styles.centered}>
            <ActivityIndicator accessibilityLabel="Carregando recarga" color={colors.accent} size="large" />
          </View>
        ) : (
          <View style={styles.content}>
            <Card style={styles.stack}>
              <Text style={typography.body}>
                {error instanceof ChargingApiError && error.status === 404
                  ? 'Esta recarga não foi encontrada.'
                  : 'Não foi possível carregar a recarga.'}
              </Text>
              <Button
                label="Tentar novamente"
                icon={RotateCw}
                variant="secondary"
                size="sm"
                loading={isRefetching}
                onPress={() => refetch()}
              />
            </Card>
          </View>
        )}
      </SafeAreaView>
      <Sheet visible={isConfirmingStop} onClose={() => setConfirmingStop(false)}>
        <View style={styles.stack}>
          <Text accessibilityRole="header" style={typography.heading}>
            Encerrar a recarga agora?
          </Text>
          <Text style={styles.sheetText}>
            {session
              ? `A cobrança considera a energia entregue até agora: ${formatEnergy(session.energyKwh)} · ${formatCents(session.energyCostCents)}.`
              : 'A cobrança considera a energia entregue até agora.'}
          </Text>
          <Button
            label="Encerrar agora"
            icon={Square}
            variant="danger"
            size="lg"
            block
            haptic="impactMedium"
            onPress={stop}
          />
          <Button
            label="Continuar carregando"
            variant="ghost"
            size="md"
            block
            onPress={() => setConfirmingStop(false)}
          />
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surfaceSheet,
  },
  sheetText: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
  },
});
