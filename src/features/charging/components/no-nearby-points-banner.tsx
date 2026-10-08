import { MapPinOff, X } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { fonts, nightColors, radii, spacing } from '@/constants/theme';

export type NoNearbyPointsBannerProps = {
  loading?: boolean;
  onShowCountry: () => void;
  onDismiss: () => void;
};

export function NoNearbyPointsBanner({ loading = false, onShowCountry, onDismiss }: NoNearbyPointsBannerProps) {
  return (
    <View testID="no-nearby-points-banner" style={styles.banner}>
      <View style={styles.header}>
        <Icon icon={MapPinOff} size={18} color={nightColors.warningText} />
        <View style={styles.texts}>
          <Text style={styles.title}>Nenhum ponto perto de você</Text>
          <Text style={styles.body}>Ainda não há pontos de recarga num raio de 50 km da sua localização.</Text>
        </View>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso"
          onPress={onDismiss}
          hitSlop={10}
          scaleTo={0.9}
        >
          <Icon icon={X} size={18} color={nightColors.textMuted} />
        </PressableScale>
      </View>
      <Button
        label="Ver pontos no Brasil"
        variant="secondary"
        scheme="night"
        size="sm"
        loading={loading}
        onPress={onShowCountry}
        style={styles.action}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: nightColors.borderSubtle,
    backgroundColor: nightColors.surfaceCard,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: nightColors.textTitle,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
  },
  action: {
    alignSelf: 'flex-start',
  },
});
