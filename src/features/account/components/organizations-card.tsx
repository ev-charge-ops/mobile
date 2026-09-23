import { Building2, RotateCw, ShieldCheck, Zap } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, Divider, SectionTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { StatusPill } from '@/components/ui/status-pill';
import { colors, spacing, typography } from '@/constants/theme';
import type { MyOrganization } from '@/features/account/api/organizations-api';
import { useMyOrganizations } from '@/features/account/api/use-my-organizations';

const membershipRoleLabels: Record<MyOrganization['role'], string> = {
  MANAGER: 'Gestor',
  DRIVER: 'Motorista',
};

export function OrganizationsCard() {
  const { data: organizations, isPending, isError, refetch, isRefetching } = useMyOrganizations();

  return (
    <View style={styles.section}>
      <SectionTitle>{organizations && organizations.length > 1 ? 'Meus condomínios' : 'Meu condomínio'}</SectionTitle>
      <Card style={styles.card}>
        {isPending ? (
          <ActivityIndicator accessibilityLabel="Carregando condomínios" color={colors.accent} />
        ) : isError ? (
          <View style={styles.stack}>
            <Text style={typography.body}>Não foi possível carregar seus condomínios.</Text>
            <Button
              label="Tentar novamente"
              icon={RotateCw}
              variant="secondary"
              size="sm"
              loading={isRefetching}
              onPress={() => refetch()}
            />
          </View>
        ) : organizations.length === 0 ? (
          <View style={styles.stack}>
            <Text style={typography.subtitle}>Você ainda não faz parte de um condomínio</Text>
            <Text style={styles.hint}>
              Peça ao gestor do seu condomínio um convite. Ao abrir o link recebido por e-mail, você entra direto por
              aqui.
            </Text>
          </View>
        ) : (
          organizations.map((organization, index) => (
            <View key={organization.id} style={styles.stack}>
              {index > 0 ? <Divider /> : null}
              <OrganizationRow organization={organization} />
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

function OrganizationRow({ organization }: { organization: MyOrganization }) {
  const isManager = organization.role === 'MANAGER';

  return (
    <View style={styles.row}>
      <Icon icon={Building2} size={22} color={colors.accentOnQuiet} />
      <View style={styles.details}>
        <Text style={typography.subtitle}>{organization.name}</Text>
        {organization.unitLabel ? <Text style={styles.hint}>Unidade {organization.unitLabel}</Text> : null}
        <StatusPill
          status={isManager ? 'info' : 'available'}
          icon={isManager ? ShieldCheck : Zap}
          label={membershipRoleLabels[organization.role]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.lg,
  },
  stack: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  details: {
    flex: 1,
    gap: spacing.xs,
  },
  hint: {
    ...typography.body,
    color: colors.textMuted,
  },
});
