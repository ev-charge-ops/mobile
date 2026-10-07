import { router } from 'expo-router';
import { LockKeyhole, LogOut, Palette, ShieldCheck, Zap } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ListRow } from '@/components/ui/list-row';
import { StatusPill } from '@/components/ui/status-pill';
import { colors, fonts, spacing } from '@/constants/theme';
import { getInitials } from '@/features/account/account-initials';
import { OrganizationsCard } from '@/features/account/components/organizations-card';
import type { components } from '@/lib/api-schema';

type User = components['schemas']['UserResponseDto'];

const roleLabels: Record<User['role'], string> = {
  DRIVER: 'Motorista',
  MANAGER: 'Gestor',
};

export type AccountScreenProps = {
  user: User;
  onSignOut: () => void;
  isSigningOut?: boolean;
  banner?: ReactNode;
};

export function AccountScreen({ user, onSignOut, isSigningOut = false, banner }: AccountScreenProps) {
  const isManager = user.role === 'MANAGER';

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppBar title="Conta" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{getInitials(user.name)}</Text>
          </View>
          <View style={styles.profileTexts}>
            <Text numberOfLines={1} style={styles.name}>
              {user.name}
            </Text>
            <Text numberOfLines={1} style={styles.email}>
              {user.email}
            </Text>
            <StatusPill
              status={isManager ? 'info' : 'available'}
              icon={isManager ? ShieldCheck : Zap}
              label={roleLabels[user.role]}
              testID="role-pill"
              style={styles.role}
            />
          </View>
        </Card>
        {banner}
        <OrganizationsCard />
        <Card padding={0}>
          <ListRow
            icon={LockKeyhole}
            label="Privacidade e dados"
            hint="Consentimentos, exportação e exclusão da conta"
            divider={false}
            onPress={() => router.push('/privacy')}
          />
        </Card>
        <View style={styles.stack}>
          <Button
            label="Ver design system"
            variant="secondary"
            icon={Palette}
            block
            onPress={() => router.push('/showcase')}
          />
          <Button label="Sair" variant="outline" icon={LogOut} block loading={isSigningOut} onPress={onSignOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    gap: spacing.xxl,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentQuiet,
  },
  initials: {
    fontSize: 20,
    fontFamily: fonts.extrabold,
    color: colors.accentOnQuiet,
  },
  profileTexts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  email: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
  },
  role: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  stack: {
    gap: spacing.md,
  },
});
