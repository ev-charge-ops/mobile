import { BellOff } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { Icon } from '@/components/ui/icon';
import { useTabBarHeight } from '@/components/ui/tab-bar';
import { colors, fonts, motion, spacing } from '@/constants/theme';

export function NotificationsScreen() {
  const tabBarHeight = useTabBarHeight();

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppBar variant="large" title="Avisos" subtitle="Cada evento financeiro é avisado" />
      <View style={[styles.content, { paddingBottom: tabBarHeight + spacing.xxl }]}>
        <Animated.View
          entering={FadeInDown.duration(motion.duration.slow).easing(motion.easing.sheet)}
          style={styles.empty}
        >
          <View style={styles.emptyIcon}>
            <Icon icon={BellOff} size={30} color={colors.textSubtle} />
          </View>
          <Text style={styles.emptyTitle}>Nenhum aviso por enquanto</Text>
          <Text style={styles.emptyHint}>
            Início e fim de recarga, tolerância e cobranças aparecem aqui assim que acontecerem.
          </Text>
        </Animated.View>
        <Text style={styles.legal}>Nenhuma cobrança acontece sem um aviso anterior.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.gutter,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
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
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  legal: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: colors.textDisabled,
    textAlign: 'center',
    padding: spacing.xs,
  },
});
