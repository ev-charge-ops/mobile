import { router } from 'expo-router';
import { MapPin, PlugZap } from 'lucide-react-native';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useTabBarHeight } from '@/components/ui/tab-bar';
import { colors, fonts, motion, spacing } from '@/constants/theme';
import { hasOpenSession, useActiveSession } from '@/features/charging/api/use-charging-sessions';
import { ActiveSessionCard } from '@/features/charging/components/active-session-card';

const entering = FadeInDown.duration(motion.duration.slow).easing(motion.easing.sheet);

export function CurrentChargeScreen() {
  const { data: session, isPending, refetch, isRefetching } = useActiveSession();
  const tabBarHeight = useTabBarHeight();
  const isActive = hasOpenSession(session);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppBar
        variant="large"
        title="Recarga"
        subtitle={isPending ? undefined : isActive ? 'Sessão em andamento' : 'Nenhuma sessão ativa'}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xxl }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.accent} />
        }
      >
        {isPending ? (
          <View style={styles.centered}>
            <ActivityIndicator accessibilityLabel="Carregando recarga" color={colors.accent} />
          </View>
        ) : isActive && session ? (
          <Animated.View entering={entering}>
            <ActiveSessionCard session={session} />
          </Animated.View>
        ) : (
          <Animated.View entering={entering} style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icon icon={PlugZap} size={30} color={colors.textSubtle} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma recarga ativa</Text>
            <Text style={styles.emptyHint}>Escolha um ponto no mapa para começar</Text>
            <Button
              label="Buscar pontos"
              icon={MapPin}
              size="lg"
              block
              haptic
              style={styles.emptyAction}
              onPress={() => router.navigate('/')}
            />
          </Animated.View>
        )}
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
    flexGrow: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    marginBottom: 80,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.borderDashed,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  emptyHint: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
});
