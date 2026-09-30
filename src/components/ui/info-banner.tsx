import { CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, radii } from '@/constants/theme';

export type InfoBannerTone = 'info' | 'success' | 'warning' | 'danger';

export type InfoBannerProps = {
  title?: string;
  children: string;
  tone?: InfoBannerTone;
  style?: StyleProp<ViewStyle>;
};

const toneStyles: Record<InfoBannerTone, { color: string; backgroundColor: string; icon: LucideIcon }> = {
  info: { color: colors.infoText, backgroundColor: colors.infoTint, icon: Info },
  success: { color: colors.energyText, backgroundColor: colors.energyTint, icon: CircleCheck },
  warning: { color: colors.warningText, backgroundColor: colors.warningTint, icon: TriangleAlert },
  danger: { color: colors.criticalText, backgroundColor: colors.criticalTint, icon: TriangleAlert },
};

export function InfoBanner({ title, children, tone = 'info', style }: InfoBannerProps) {
  const toneStyle = toneStyles[tone];

  return (
    <View style={[styles.banner, { backgroundColor: toneStyle.backgroundColor }, style]}>
      <Icon icon={toneStyle.icon} size={18} color={toneStyle.color} style={styles.icon} />
      <View style={styles.texts}>
        {title ? <Text style={[styles.title, { color: toneStyle.color }]}>{title}</Text> : null}
        <Text style={styles.body}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
  },
  icon: {
    marginTop: 1,
  },
  texts: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.bold,
    marginBottom: 2,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textBody,
  },
});
