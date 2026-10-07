import { router } from 'expo-router';
import { LogOut, Palette, ShieldCheck, Zap } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusPill } from '@/components/ui/status-pill';
import { colors, spacing, typography } from '@/constants/theme';
import { OrganizationsCard } from '@/features/home/components/organizations-card';
import type { components } from '@/lib/api-schema';

type User = components['schemas']['UserResponseDto'];

const roleLabels: Record<User['role'], string> = {
  DRIVER: 'Motorista',
  MANAGER: 'Gestor',
};

export type HomeScreenProps = {
  user: User;
  onSignOut: () => void;
  isSigningOut?: boolean;
  banner?: ReactNode;
};

export function HomeScreen({ user, onSignOut, isSigningOut = false, banner }: HomeScreenProps) {
  const isManager = user.role === 'MANAGER';

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppBar variant="large" title={`Olá, ${user.name}`} subtitle={user.email} />
      <ScrollView contentContainerStyle={styles.content}>
        {banner}
        <Card style={styles.stack}>
          <StatusPill
            status={isManager ? 'info' : 'available'}
            icon={isManager ? ShieldCheck : Zap}
            label={roleLabels[user.role]}
            testID="role-pill"
          />
          <Text style={typography.body}>
            {isManager
              ? 'Em breve você poderá gerenciar estações, tarifas e acompanhar a operação por aqui.'
              : 'Em breve você poderá encontrar estações próximas e iniciar suas recargas por aqui.'}
          </Text>
        </Card>
        <OrganizationsCard />
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
    paddingBottom: spacing.massive,
  },
  stack: {
    gap: spacing.md,
  },
});
