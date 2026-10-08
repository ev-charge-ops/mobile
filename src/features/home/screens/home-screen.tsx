import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Rise } from '@/components/ui/rise';
import { useTabBarHeight } from '@/components/ui/tab-bar';
import { colors, fonts, spacing } from '@/constants/theme';
import { HomeChargeCard, HomeEmptyCharge } from '@/features/home/components/home-charge-card';
import { HomeHeader } from '@/features/home/components/home-header';
import { HomeHero } from '@/features/home/components/home-hero';
import { HomePointRow } from '@/features/home/components/home-point-row';
import type { HomeCharge, HomePoint } from '@/features/home/home-summary';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';

export type HomeScreenProps = {
  greeting: string;
  initials: string;
  subtitle: string | null;
  actions?: ReactNode;
  charge: HomeCharge | null;
  isChargeLoading: boolean;
  points: HomePoint[];
  isPointsLoading: boolean;
  onRefresh: () => Promise<unknown>;
};

const POINTS_START_INDEX = 4;

export function HomeScreen({
  greeting,
  initials,
  subtitle,
  actions,
  charge,
  isChargeLoading,
  points,
  isPointsLoading,
  onRefresh,
}: HomeScreenProps) {
  const tabBarHeight = useTabBarHeight();
  const { refreshing, onRefresh: refresh } = usePullToRefresh(onRefresh);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        testID="home-scroll"
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
      >
        <Rise index={0} style={styles.gutter}>
          <HomeHeader greeting={greeting} initials={initials} subtitle={subtitle} actions={actions} />
        </Rise>
        <Rise index={1} style={styles.gutter}>
          <HomeHero session={charge} />
        </Rise>
        <View style={styles.stack}>
          {isChargeLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator accessibilityLabel="Carregando recarga" color={colors.accent} />
            </View>
          ) : (
            <Rise index={2}>{charge ? <HomeChargeCard charge={charge} /> : <HomeEmptyCharge />}</Rise>
          )}
          <Rise index={3} style={styles.sectionHead}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Pontos do condomínio
            </Text>
            <Pressable accessibilityRole="link" hitSlop={10} onPress={() => router.navigate('/points')}>
              {({ pressed }) => <Text style={[styles.sectionLink, pressed && styles.pressed]}>Ver mapa</Text>}
            </Pressable>
          </Rise>
          {isPointsLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator accessibilityLabel="Carregando pontos" color={colors.accent} />
            </View>
          ) : points.length === 0 ? (
            <Rise index={POINTS_START_INDEX} style={styles.emptyPoints}>
              <Text style={styles.emptyPointsText}>Nenhum ponto de recarga disponível por aqui ainda.</Text>
            </Rise>
          ) : (
            points.map((point, index) => (
              <Rise key={point.id} index={POINTS_START_INDEX + index}>
                <HomePointRow point={point} />
              </Rise>
            ))
          )}
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
    flexGrow: 1,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  gutter: {
    paddingHorizontal: spacing.gutter,
  },
  stack: {
    paddingHorizontal: spacing.md,
    gap: 10,
  },
  loading: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  sectionLink: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textLink,
  },
  pressed: {
    opacity: 0.6,
  },
  emptyPoints: {
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: colors.surfaceCard,
  },
  emptyPointsText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});
