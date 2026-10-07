import { Building2, Home, Mail, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { colors, spacing, typography } from '@/constants/theme';
import type { InvitePreview } from '@/features/auth/api/auth-api';

export function InviteDetails({ invite }: { invite: InvitePreview }) {
  return (
    <Card style={styles.card}>
      <InviteDetail icon={Building2} label="Condomínio" value={invite.organizationName} />
      {invite.unitLabel ? <InviteDetail icon={Home} label="Unidade" value={invite.unitLabel} /> : null}
      <InviteDetail icon={Mail} label="E-mail convidado" value={invite.email} />
    </Card>
  );
}

function InviteDetail({ icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Icon icon={icon} size={20} color={colors.accentOnQuiet} />
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  label: {
    ...typography.label,
    color: colors.textSubtle,
  },
  value: {
    ...typography.subtitle,
  },
});
