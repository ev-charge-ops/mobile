import { ChevronLeft, Download, FileText, Lock, LogOut, RotateCw, ShieldCheck, Trash2 } from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Rise } from '@/components/ui/rise';
import { Toggle } from '@/components/ui/toggle';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, spacing } from '@/constants/theme';
import type { ConsentPurpose, MyConsents } from '@/features/privacy/api/privacy-api';
import { useExportMyData, useMyConsents, useUpdateConsents } from '@/features/privacy/api/use-privacy';
import { DeletionRequestSheet } from '@/features/privacy/components/deletion-request-sheet';
import {
  buildConsentsPayload,
  formatTermsVersion,
  getConsentErrorMessage,
  isOutdatedTermsError,
  isPurposeGranted,
  shareDataExport,
  type ConsentChoices,
} from '@/features/privacy/consent-choices';

export type ConsentScreenMode = 'gate' | 'settings';

export type ConsentScreenProps = {
  mode: ConsentScreenMode;
  onBack?: () => void;
  onDone?: () => void;
  onSignOut?: () => void;
};

const LEGAL_NOTE = 'Tratamento de dados conforme a LGPD · Lei 13.709/2018';

export function ConsentScreen({ mode, onBack, onDone, onSignOut }: ConsentScreenProps) {
  const consentsQuery = useMyConsents();
  const isGate = mode === 'gate';

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <Rise index={0} style={styles.header}>
        {!isGate && onBack ? (
          <IconButton icon={ChevronLeft} tone="surface" accessibilityLabel="Voltar" onPress={onBack} />
        ) : null}
        <View style={styles.headerTexts}>
          <Text accessibilityRole="header" style={styles.title}>
            {isGate ? 'O que coletamos e por quê' : 'Privacidade e dados'}
          </Text>
          <Text style={styles.headerHint}>LGPD · Lei 13.709/2018</Text>
        </View>
        {isGate && onSignOut ? (
          <IconButton icon={LogOut} tone="surface" accessibilityLabel="Sair" onPress={onSignOut} />
        ) : null}
      </Rise>
      {consentsQuery.data ? (
        <ConsentForm consents={consentsQuery.data} mode={mode} onDone={onDone} />
      ) : consentsQuery.isError ? (
        <View style={styles.centered}>
          <Text style={styles.message}>Não foi possível carregar seus consentimentos.</Text>
          <Button
            label="Tentar novamente"
            icon={RotateCw}
            variant="secondary"
            size="sm"
            loading={consentsQuery.isFetching}
            onPress={() => consentsQuery.refetch()}
          />
        </View>
      ) : (
        <View style={styles.centered}>
          <ActivityIndicator accessibilityLabel="Carregando consentimentos" color={colors.accent} size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}

type ConsentFormProps = {
  consents: MyConsents;
  mode: ConsentScreenMode;
  onDone?: () => void;
};

function ConsentForm({ consents, mode, onDone }: ConsentFormProps) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const consentsQuery = useMyConsents();
  const updateConsents = useUpdateConsents();
  const exportData = useExportMyData();
  const [choices, setChoices] = useState<ConsentChoices>({});
  const [deletionVisible, setDeletionVisible] = useState(false);
  const isGate = mode === 'gate';

  const submit = (next: ConsentChoices, onFailure?: () => void) => {
    updateConsents.mutate(buildConsentsPayload(consents.termsVersion, consents.purposes, next), {
      onSuccess: () => {
        if (isGate) {
          setChoices({});
          toast.show('Tudo certo. Boas recargas!');
          onDone?.();
        }
      },
      onError: (error) => {
        onFailure?.();
        toast.show(getConsentErrorMessage(error), { tone: 'error' });
        if (isOutdatedTermsError(error)) consentsQuery.refetch();
      },
    });
  };

  const changePurpose = (purpose: ConsentPurpose, granted: boolean) => {
    const previous = choices;
    const next = { ...choices, [purpose]: granted };
    setChoices(next);
    if (!isGate) submit(next, () => setChoices(previous));
  };

  const exportMyData = () => {
    exportData.mutate(undefined, {
      onSuccess: (data) => {
        shareDataExport(data).catch(() => undefined);
      },
      onError: () => toast.show('Não foi possível exportar seus dados. Tente novamente.', { tone: 'error' }),
    });
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.body, !isGate && { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Rise index={1} style={[styles.card, styles.terms]}>
          <View style={styles.termsIcon}>
            <Icon icon={FileText} size={20} color={colors.textTitle} />
          </View>
          <View style={styles.termsTexts}>
            <Text style={styles.termsTitle}>Termos de uso e privacidade</Text>
            <Text style={styles.termsVersion}>{formatTermsVersion(consents.termsVersion)}</Text>
          </View>
        </Rise>

        <Rise index={2}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Como usamos seus dados
          </Text>
        </Rise>
        <Rise index={3} style={[styles.card, styles.list]}>
          {consents.purposes.map((purpose, index) => {
            const granted = isPurposeGranted(purpose, choices);
            return (
              <Fragment key={purpose.purpose}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.purpose} testID={`purpose-${purpose.purpose}`}>
                  <View style={styles.purposeTexts}>
                    <View style={styles.purposeHead}>
                      <Text style={styles.purposeTitle}>{purpose.title}</Text>
                      {purpose.required ? (
                        <View style={styles.requiredPill}>
                          <Icon icon={Lock} size={12} color={colors.textBody} />
                          <Text style={styles.requiredLabel}>obrigatório</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.purposeDescription}>{purpose.description}</Text>
                  </View>
                  <Toggle
                    checked={granted}
                    disabled={purpose.required}
                    accessibilityLabel={purpose.title}
                    onChange={(value) => changePurpose(purpose.purpose, value)}
                  />
                </View>
              </Fragment>
            );
          })}
        </Rise>

        <Rise index={4}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Seus direitos
          </Text>
        </Rise>
        <Rise index={5}>
          <Button
            label={exportData.isPending ? 'Preparando arquivo…' : 'Exportar meus dados'}
            icon={Download}
            variant="outline"
            size="lg"
            block
            loading={exportData.isPending}
            onPress={exportMyData}
          />
        </Rise>
        <Rise index={6} style={styles.deletion}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Excluir conta"
            hitSlop={8}
            onPress={() => setDeletionVisible(true)}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          >
            <Icon icon={Trash2} size={18} color={colors.criticalText} />
            <Text style={styles.deleteLabel}>Excluir conta</Text>
          </Pressable>
          <Text style={styles.deletionNote}>
            Ao excluir a conta, mantemos apenas os registros de sessões necessários à cobrança e ao rateio, pelo prazo
            exigido em lei.
          </Text>
        </Rise>

        {isGate ? null : (
          <Rise index={7}>
            <Text style={styles.legal}>{LEGAL_NOTE}</Text>
          </Rise>
        )}
      </ScrollView>

      {isGate ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Button
            label="Aceitar e continuar"
            icon={ShieldCheck}
            size="lg"
            block
            haptic="success"
            loading={updateConsents.isPending}
            onPress={() => submit(choices)}
          />
          <Text style={styles.footerHint}>Você pode revisar cada finalidade depois, em Conta · Privacidade.</Text>
        </View>
      ) : null}

      <DeletionRequestSheet visible={deletionVisible} onClose={() => setDeletionVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTexts: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: fonts.bold,
    letterSpacing: -0.7,
    color: colors.textTitle,
  },
  headerHint: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: colors.textBody,
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 24,
    borderCurve: 'continuous',
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  termsIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
  },
  termsTexts: {
    flex: 1,
    gap: 1,
  },
  termsTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  termsVersion: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textMuted,
    marginTop: 10,
    marginHorizontal: spacing.sm,
  },
  list: {
    paddingVertical: spacing.xs,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.hairline,
  },
  purpose: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
  },
  purposeTexts: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  purposeHead: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  purposeTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  requiredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.surfaceInset,
  },
  requiredLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textBody,
  },
  purposeDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  deletion: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  deleteButton: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  deleteLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.criticalText,
  },
  pressed: {
    opacity: 0.6,
  },
  deletionNote: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  legal: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
    textAlign: 'center',
    paddingTop: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surfaceSheet,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
  footerHint: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
