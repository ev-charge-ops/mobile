import { router } from 'expo-router';
import { RotateCw, Unplug } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, getColors, spacing, typography } from '@/constants/theme';
import {
  ChargingApiError,
  type ChargingSession,
  type ChargingSessionStatus,
} from '@/features/charging/api/charging-api';
import { useChargingSession, usePayForSession, useStopSession } from '@/features/charging/api/use-charging-sessions';
import { getCardPaymentErrorMessage, getStopSessionErrorMessage } from '@/features/charging/charging-errors';
import { formatCents } from '@/features/charging/charging-format';
import { LiveChargingNight } from '@/features/charging/components/live-charging-night';
import { PaymentView } from '@/features/charging/components/payment-view';
import { ReleasePanel } from '@/features/charging/components/release-panel';
import { SessionReceipt } from '@/features/charging/components/session-receipt';
import { buildReceiptShareText } from '@/features/charging/receipt-share';
import { isSessionOpen } from '@/features/charging/session-timing';
import { useSessionHaptics } from '@/features/charging/use-session-haptics';
import { useNightStatusBar } from '@/features/charging/use-night-status-bar';
import { useSessionReminderSync } from '@/features/charging/use-session-reminders';
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

const nightStatuses: readonly ChargingSessionStatus[] = ['ACTIVE', 'GRACE', 'IDLE'];

export function isNightStatus(status: ChargingSessionStatus | undefined) {
  return status !== undefined && nightStatuses.includes(status);
}

function usePlugMoment(status: ChargingSessionStatus | undefined) {
  const [previous, setPrevious] = useState(status);
  const [plugged, setPlugged] = useState(false);
  if (previous !== status) {
    const wasStarting = previous === 'PENDING' || previous === 'AWAITING_PAYMENT';
    setPrevious(status);
    if (wasStarting && status === 'ACTIVE') setPlugged(true);
  }
  return plugged;
}

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function SessionScreen({ sessionId }: SessionScreenProps) {
  const { data: session, isPending, error, refetch, isRefetching, dataUpdatedAt } = useChargingSession(sessionId);
  const stopSession = useStopSession(sessionId);
  const payForSession = usePayForSession();
  const toast = useToast();
  const [isConfirmingStop, setConfirmingStop] = useState(false);
  const isOpen = session ? isSessionOpen(session.status) : false;
  const now = useNow(1000, isOpen);
  const isNight = isNightStatus(session?.status);
  const scheme = isNight ? 'night' : 'light';
  const justPlugged = usePlugMoment(session?.status);
  useSessionHaptics(session?.status);
  useSessionReminderSync(session);
  useNightStatusBar(isNight);

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

  const shareReceipt = () => {
    if (!session) return;
    Share.share({ title: 'Recibo da recarga', message: buildReceiptShareText(session) }).catch(() =>
      toast.show('Não foi possível compartilhar o recibo.', { tone: 'error' }),
    );
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

  const stopSheet = (
    <Sheet
      visible={isConfirmingStop}
      onClose={() => setConfirmingStop(false)}
      scheme={scheme}
    >
      <View style={styles.stack}>
        <Text accessibilityRole="header" style={[typography.heading, { color: getColors(scheme).textTitle }]}>
          Encerrar a recarga agora?
        </Text>
        <Text style={[styles.sheetText, { color: getColors(scheme).textMuted }]}>
          {session
            ? `A cobrança considera a energia entregue até agora: ${formatEnergy(session.energyKwh)} · ${formatCents(session.energyCostCents)}.`
            : 'A cobrança considera a energia entregue até agora.'}
        </Text>
        <Button
          label="Encerrar agora"
          icon={Unplug}
          variant="danger"
          scheme={scheme}
          size="lg"
          block
          haptic="impactMedium"
          onPress={stop}
        />
        <Button
          label="Continuar carregando"
          variant="ghost"
          scheme={scheme}
          size="md"
          block
          onPress={() => setConfirmingStop(false)}
        />
      </View>
    </Sheet>
  );

  if (session && isNight) {
    return (
      <View style={styles.night}>
        <LiveChargingNight
          session={session}
          now={now}
          readAt={dataUpdatedAt}
          justPlugged={justPlugged}
          isStopping={stopSession.isPending}
          onBack={goBack}
          onStop={session.status === 'ACTIVE' ? () => setConfirmingStop(true) : stop}
        />
        {stopSheet}
      </View>
    );
  }

  if (session?.status === 'AWAITING_PAYMENT') {
    return (
      <PaymentView
        session={session}
        isPaying={payForSession.isPending}
        isCanceling={stopSession.isPending}
        onPay={pay}
        onCancel={stop}
        onClose={goBack}
      />
    );
  }

  if (session && !isOpen) {
    return <SessionReceipt session={session} now={now} onShare={shareReceipt} onDone={() => router.dismissTo('/')} />;
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
        <AppBar title={session ? titles[session.status] : 'Recarga'} onBack={goBack} />
        {session ? (
          <>
            <ScrollView contentContainerStyle={styles.content}>
              <ReleasePanel session={session} />
            </ScrollView>
            <View style={styles.footer}>
              <Button
                label="Cancelar"
                variant="ghost"
                size="md"
                block
                loading={stopSession.isPending}
                onPress={stop}
              />
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
      {stopSheet}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  night: {
    flex: 1,
    backgroundColor: getColors('night').bgBase,
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
