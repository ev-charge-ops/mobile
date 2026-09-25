import { Download, FileText, LogOut, RotateCw, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadeInItem } from '@/components/ui/fade-in-item';
import { IconButton } from '@/components/ui/icon-button';
import { ListRow } from '@/components/ui/list-row';
import { Toggle } from '@/components/ui/toggle';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import type { MyConsents } from '@/features/privacy/api/privacy-api';
import {
  useExportMyData,
  useMyConsents,
  useUpdateConsents,
} from '@/features/privacy/api/use-privacy';
import { DeletionRequestSheet } from '@/features/privacy/components/deletion-request-sheet';
import {
  buildConsentsPayload,
  formatTermsVersion,
  getConsentErrorMessage,
  isOutdatedTermsError,
  isPurposeGranted,
  purposeIcons,
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

export function ConsentScreen({ mode, onBack, onDone, onSignOut }: ConsentScreenProps) {
  const consentsQuery = useMyConsents();
  const isGate = mode === 'gate';

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppBar
        title={isGate ? 'Consentimento' : 'Privacidade e dados'}
        onBack={isGate ? undefined : onBack}
        actions={
          isGate && onSignOut ? <IconButton icon={LogOut} accessibilityLabel="Sair" onPress={onSignOut} /> : null
        }
      />
      {consentsQuery.data ? (
        <ConsentForm consents={consentsQuery.data} mode={mode} onDone={onDone} />
      ) : consentsQuery.isError ? (
        <View style={styles.centered}>
          <Text style={typography.body}>Não foi possível carregar seus consentimentos.</Text>
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

  const save = () => {
    updateConsents.mutate(buildConsentsPayload(consents.termsVersion, consents.purposes, choices), {
      onSuccess: () => {
        setChoices({});
        toast.show(isGate ? 'Tudo certo. Boas recargas!' : 'Preferências salvas.');
        onDone?.();
      },
      onError: (error) => {
        toast.show(getConsentErrorMessage(error), { tone: 'error' });
        if (isOutdatedTermsError(error)) consentsQuery.refetch();
      },
    });
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
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <FadeInItem index={0}>
          <Text style={styles.title}>O que coletamos e por quê</Text>
          <Text style={styles.subtitle}>
            Coletamos apenas o necessário. Cada finalidade pode ser recusada, exceto as obrigatórias para a cobrança.
          </Text>
        </FadeInItem>

        <FadeInItem index={1}>
          <Card padding={0}>
            {consents.purposes.map((purpose, index) => {
              const granted = isPurposeGranted(purpose, choices);
              return (
                <ListRow
                  key={purpose.purpose}
                  icon={purposeIcons[purpose.purpose]}
                  label={purpose.title}
                  hint={purpose.required ? `Obrigatório · ${purpose.description}` : purpose.description}
                  divider={index < consents.purposes.length - 1}
                  testID={`purpose-${purpose.purpose}`}
                  trailing={
                    <Toggle
                      checked={granted}
                      disabled={purpose.required}
                      accessibilityLabel={purpose.title}
                      onChange={(value) => setChoices((current) => ({ ...current, [purpose.purpose]: value }))}
                    />
                  }
                />
              );
            })}
          </Card>
        </FadeInItem>

        <FadeInItem index={2}>
          <Card padding={0}>
            <ListRow
              icon={FileText}
              label="Termo de consentimento"
              hint={formatTermsVersion(consents.termsVersion)}
            />
            <ListRow
              icon={Download}
              label="Exportar meus dados"
              hint={exportData.isPending ? 'Preparando arquivo…' : 'Portabilidade em JSON'}
              onPress={exportData.isPending ? undefined : exportMyData}
            />
            <ListRow
              icon={Trash2}
              label="Solicitar exclusão da conta"
              hint="Eliminação dos dados pessoais"
              divider={false}
              onPress={() => setDeletionVisible(true)}
            />
          </Card>
        </FadeInItem>

        <Text style={styles.legal}>Histórico de sessões anonimizado após 24 meses · LGPD</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          label={isGate ? 'Aceitar e continuar' : 'Salvar preferências'}
          icon={ShieldCheck}
          size="lg"
          block
          haptic="success"
          loading={updateConsents.isPending}
          onPress={save}
        />
        {isGate ? (
          <Text style={styles.footerHint}>Você pode revisar cada finalidade depois, em Conta · Privacidade.</Text>
        ) : null}
      </View>

      <DeletionRequestSheet visible={deletionVisible} onClose={() => setDeletionVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  body: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: 6,
    marginBottom: spacing.xs,
  },
  legal: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: colors.textDisabled,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surfaceSheet,
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: -12 },
    elevation: 16,
  },
  footerHint: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    textAlign: 'center',
  },
});
