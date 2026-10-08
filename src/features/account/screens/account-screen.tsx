import Constants from 'expo-constants';
import { router } from 'expo-router';
import {
  ChevronRight,
  ExternalLink,
  FileText,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { Fragment, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Rise } from '@/components/ui/rise';
import { useTabBarHeight } from '@/components/ui/tab-bar';
import { colors, fonts, palette, spacing } from '@/constants/theme';
import { getInitials } from '@/features/account/account-initials';
import { useMyOrganizations } from '@/features/account/api/use-my-organizations';
import { formatMembershipLine } from '@/features/account/unit-subtitle';
import type { components } from '@/lib/api-schema';
import { openExternalLink } from '@/lib/external-links';
import { formatEnergy } from '@/utils/format-energy';

type User = components['schemas']['UserResponseDto'];

export type AccountMonthSummary = { energyKwh: number; totalCents: number };

export type AccountScreenProps = {
  user: User;
  onSignOut: () => void;
  isSigningOut?: boolean;
  banner?: ReactNode;
  monthSummary?: AccountMonthSummary | null;
};

const amountFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatAppVersion(version: string | undefined) {
  return version ? `Versão ${version}` : null;
}

export function AccountScreen({ user, onSignOut, isSigningOut = false, banner, monthSummary }: AccountScreenProps) {
  const tabBarHeight = useTabBarHeight();
  const { data: organizations } = useMyOrganizations();
  const membership = formatMembershipLine(organizations);
  const version = formatAppVersion(Constants.expoConfig?.version);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Rise index={0}>
          <Text accessibilityRole="header" style={styles.title}>
            Conta
          </Text>
        </Rise>

        <Rise index={1} style={[styles.card, styles.profile]}>
          <View style={styles.profileHead}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{getInitials(user.name)}</Text>
            </View>
            <View style={styles.profileTexts}>
              <Text numberOfLines={1} style={styles.name}>
                {user.name}
              </Text>
              <Text numberOfLines={1} style={styles.membership}>
                {membership ?? user.email}
              </Text>
            </View>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Editar perfil"
              onPress={() => router.push('/profile')}
              style={styles.editButton}
            >
              <Text style={styles.editLabel}>Editar perfil</Text>
            </PressableScale>
          </View>
          {monthSummary ? (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`Este mês, ${formatEnergy(monthSummary.energyKwh)}, R$ ${amountFormatter.format(monthSummary.totalCents / 100)}`}
              scaleTo={0.98}
              onPress={() => router.navigate('/history')}
              style={styles.month}
              testID="account-month"
            >
              <Text style={styles.monthLabel}>Este mês</Text>
              <View style={styles.pair}>
                <Text style={styles.pairValue}>{formatEnergy(monthSummary.energyKwh, { withUnit: false })}</Text>
                <Text style={styles.pairUnit}>kWh</Text>
              </View>
              <View style={styles.monthDivider} />
              <View style={styles.pair}>
                <Text style={styles.pairUnit}>R$</Text>
                <Text style={styles.pairValue}>{amountFormatter.format(monthSummary.totalCents / 100)}</Text>
              </View>
              <Icon icon={ChevronRight} size={18} color={colors.textDisabled} />
            </PressableScale>
          ) : null}
          {organizations && organizations.length === 0 ? (
            <Text style={styles.noCondo}>
              Você ainda não faz parte de um condomínio. Peça um convite ao gestor e abra o link recebido por e-mail.
            </Text>
          ) : null}
        </Rise>

        {banner ? <Rise index={2}>{banner}</Rise> : null}

        <Rise index={3}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Segurança e privacidade
          </Text>
        </Rise>
        <Rise index={4} style={[styles.card, styles.list]}>
          {[
            {
              icon: KeyRound,
              label: user.hasPassword ? 'Alterar senha' : 'Criar senha',
              onPress: () => router.push('/change-password'),
            },
            {
              icon: LockKeyhole,
              label: 'Privacidade e dados',
              hint: 'LGPD · consentimentos e exportação',
              onPress: () => router.push('/privacy'),
            },
          ].map((row, index) => (
            <Fragment key={row.label}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <AccountRow {...row} />
            </Fragment>
          ))}
        </Rise>

        <Rise index={5}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Ajuda e informações
          </Text>
        </Rise>
        <Rise index={6} style={[styles.card, styles.list]}>
          {[
            { icon: LifeBuoy, label: 'Suporte', hint: 'Dúvidas, problemas e contato', link: 'support' as const },
            { icon: FileText, label: 'Termos de uso', link: 'terms' as const },
            { icon: ShieldCheck, label: 'Política de privacidade', link: 'privacy' as const },
          ].map(({ link, ...row }, index) => (
            <Fragment key={row.label}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <AccountRow {...row} external onPress={() => openExternalLink(link)} />
            </Fragment>
          ))}
        </Rise>

        <Rise index={7}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair"
            disabled={isSigningOut}
            onPress={onSignOut}
            style={({ pressed }) => [styles.card, styles.signOut, pressed && styles.pressed]}
          >
            <View style={[styles.rowIcon, styles.signOutIcon]}>
              <Icon icon={LogOut} size={18} color={colors.criticalText} />
            </View>
            <Text style={styles.signOutLabel}>Sair</Text>
            {isSigningOut ? <ActivityIndicator color={colors.criticalText} /> : null}
          </Pressable>
        </Rise>

        {version ? (
          <Rise index={8}>
            <Text style={styles.version}>{version}</Text>
          </Rise>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

type AccountRowProps = {
  icon: LucideIcon;
  label: string;
  hint?: string;
  external?: boolean;
  onPress: () => void;
};

function AccountRow({ icon, label, hint, external = false, onPress }: AccountRowProps) {
  return (
    <Pressable
      accessibilityRole={external ? 'link' : 'button'}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.rowIcon}>
        <Icon icon={icon} size={18} color={colors.textTitle} />
      </View>
      <View style={styles.rowTexts}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <Icon icon={external ? ExternalLink : ChevronRight} size={18} color={colors.textDisabled} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: fonts.bold,
    letterSpacing: -0.9,
    color: colors.textTitle,
    marginHorizontal: spacing.sm,
    marginBottom: 6,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 24,
    borderCurve: 'continuous',
  },
  profile: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  profileHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInverse,
  },
  initials: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: colors.textOnInverse,
  },
  profileTexts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontSize: 18,
    lineHeight: 23,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  membership: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  editButton: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
  },
  editLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  month: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.surfaceInset,
  },
  monthLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  pair: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  pairValue: {
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
    color: colors.textTitle,
  },
  pairUnit: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.textMuted,
  },
  monthDivider: {
    width: 1,
    height: 20,
    backgroundColor: palette.ink300,
  },
  noCondo: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.medium,
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
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
  },
  rowTexts: {
    flex: 1,
    gap: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.textTitle,
  },
  rowHint: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    marginLeft: 60,
    marginRight: spacing.lg,
    backgroundColor: colors.hairline,
  },
  signOut: {
    minHeight: 52,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  signOutIcon: {
    backgroundColor: colors.criticalTint,
  },
  signOutLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.criticalText,
  },
  pressed: {
    opacity: 0.7,
  },
  version: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
