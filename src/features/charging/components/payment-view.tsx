import { CreditCard, Lock, ShieldCheck, Sparkles, X } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { InfoBanner } from '@/components/ui/info-banner';
import { Rise } from '@/components/ui/rise';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { ChargingSession } from '@/features/charging/api/charging-api';
import { formatAmount, formatCents } from '@/features/charging/charging-format';

const amountFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function getBaseRateCents(session: ChargingSession) {
  if (session.demandFactor <= 0) return session.lockedRateCents;
  return Math.round(session.lockedRateCents / session.demandFactor);
}

export type PaymentViewProps = {
  session: ChargingSession;
  isPaying: boolean;
  isCanceling: boolean;
  onPay: () => void;
  onCancel: () => void;
  onClose: () => void;
};

export function PaymentView({ session, isPaying, isCanceling, onPay, onCancel, onClose }: PaymentViewProps) {
  const insets = useSafeAreaInsets();
  const authorized = session.payment?.authorizedCents ?? 0;
  const isModel = session.demandFactorSource === 'MODEL';
  const factor = amountFormatter.format(session.demandFactor);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Rise style={styles.header}>
          <View style={styles.titles}>
            <Text accessibilityRole="header" style={styles.title}>
              Pagamento no cartão
            </Text>
            <Text style={styles.subtitle}>{`${session.chargePoint.code} · ${session.chargePoint.name}`}</Text>
          </View>
          <IconButton icon={X} tone="surface" accessibilityLabel="Fechar" onPress={onClose} />
        </Rise>

        <Rise index={1} style={styles.rateCard}>
          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>Tarifa base</Text>
            <View style={styles.amount}>
              <Text style={styles.unit}>R$</Text>
              <Text style={styles.rateValue}>{formatAmount(getBaseRateCents(session))}</Text>
              <Text style={styles.unit}>/kWh</Text>
            </View>
          </View>
          <View style={styles.rateRow}>
            <View style={styles.factorLabel}>
              <Text style={styles.rateLabel}>Fator de demanda</Text>
              <Text style={styles.badge}>{isModel ? 'IA' : 'Regra'}</Text>
            </View>
            <View style={styles.amount}>
              <Text style={styles.unit}>×</Text>
              <Text style={styles.rateValue}>{factor}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={[styles.rateRow, styles.rateRowEnd]}>
            <View style={styles.lockedTexts}>
              <Text style={styles.lockedTitle}>Tarifa desta sessão</Text>
              <View style={styles.lockedHint}>
                <Icon icon={Lock} size={13} color={colors.energyText} />
                <Text style={styles.lockedHintText}>travada ao iniciar</Text>
              </View>
            </View>
            <View style={styles.amount}>
              <Text style={styles.unitLarge}>R$</Text>
              <Text style={styles.lockedValue}>{formatAmount(session.lockedRateCents)}</Text>
              <Text style={styles.unitLarge}>/kWh</Text>
            </View>
          </View>
        </Rise>

        <Rise index={2} style={styles.infoBox}>
          <Icon icon={Sparkles} size={20} color={colors.infoText} style={styles.infoIcon} />
          <View style={styles.flex}>
            <Text style={styles.infoTitle}>{`Fator de demanda ${factor}`}</Text>
            <Text style={styles.infoBody}>
              {isModel
                ? 'O fator é calculado por IA a partir da ocupação da garagem e da demanda contratada. Fora do pico, ele volta a 1,00.'
                : 'O fator segue a regra de horário do ponto. Fora do pico, ele volta a 1,00.'}
            </Text>
          </View>
        </Rise>

        <Rise index={3} style={styles.holdBox}>
          <View style={styles.flex}>
            <Text style={styles.holdTitle}>Pré-autorização</Text>
            <Text style={styles.holdHint}>Captura do valor real ao encerrar</Text>
          </View>
          <View style={styles.amount}>
            <Text style={styles.unitLarge}>R$</Text>
            <Text accessibilityLabel={`Pré-autorização de ${formatCents(authorized)}`} style={styles.holdValue}>
              {formatAmount(authorized)}
            </Text>
          </View>
        </Rise>

        <Rise index={4} style={styles.cardRow}>
          <View style={styles.cardIcon}>
            <Icon icon={CreditCard} size={18} color={colors.textOnAccent} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>Cartão na tela segura do Stripe</Text>
            <Text style={styles.holdHint}>Use um cartão salvo ou cadastre outro no próximo passo</Text>
          </View>
        </Rise>

        {session.payment?.status === 'FAILED' ? (
          <InfoBanner tone="danger" title="Cartão recusado">
            O cartão não autorizou a pré-autorização. Tente de novo com outro cartão ou cancele a recarga.
          </InfoBanner>
        ) : null}

        <Rise index={5} style={styles.secureRow}>
          <Icon icon={ShieldCheck} size={16} color={colors.textMuted} />
          <Text style={styles.secureText}>Ponto comercial · só o consumido é cobrado</Text>
        </Rise>
      </ScrollView>
      <Rise index={6} style={styles.footer}>
        <Button
          label={`Autorizar ${formatCents(authorized)} e iniciar`}
          icon={CreditCard}
          size="xl"
          block
          haptic
          loading={isPaying}
          disabled={isCanceling}
          onPress={onPay}
        />
        <Button
          label="Cancelar recarga"
          variant="ghost"
          block
          loading={isCanceling}
          disabled={isPaying}
          onPress={onCancel}
        />
      </Rise>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceSheet,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  titles: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 26,
    lineHeight: 29,
    fontFamily: fonts.bold,
    letterSpacing: -0.8,
    color: colors.textTitle,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  rateCard: {
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceInset,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateRowEnd: {
    alignItems: 'flex-end',
  },
  rateLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.textBody,
  },
  factorLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.sm,
    backgroundColor: colors.infoTint,
    color: colors.infoText,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  amount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  unit: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  unitLarge: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  rateValue: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  lockedTexts: {
    gap: 2,
  },
  lockedTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  lockedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  lockedHintText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.energyText,
  },
  lockedValue: {
    fontSize: 28,
    lineHeight: 30,
    fontFamily: fonts.bold,
    letterSpacing: -0.8,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.infoTint,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.infoText,
  },
  infoBody: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.medium,
    color: colors.infoText,
  },
  holdBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  holdTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  holdHint: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  holdValue: {
    fontSize: 30,
    lineHeight: 32,
    fontFamily: fonts.bold,
    letterSpacing: -0.9,
    color: colors.textTitle,
    fontVariant: ['tabular-nums'],
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceInset,
  },
  cardIcon: {
    width: 44,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  secureText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  footer: {
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
  },
});
