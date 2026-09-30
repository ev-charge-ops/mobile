import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { fonts, getColors, radii, type ColorScheme } from '@/constants/theme';

export type ChipProps = {
  label: string;
  icon?: LucideIcon;
  selected?: boolean;
  scheme?: ColorScheme;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Chip({ label, icon, selected = false, scheme = 'light', onPress, style, testID }: ChipProps) {
  const tokens = getColors(scheme);
  const isNight = scheme === 'night';
  const containerStyle: ViewStyle = selected
    ? { backgroundColor: tokens.accent }
    : isNight
      ? { backgroundColor: tokens.surfaceChrome, borderWidth: 1, borderColor: tokens.borderSubtle }
      : { backgroundColor: tokens.surfaceInset };
  const textColor = selected ? tokens.textOnAccent : tokens.textTitle;
  const iconColor = selected ? tokens.textOnAccent : tokens.textMuted;

  const content = (
    <>
      {icon ? <Icon icon={icon} size={15} color={iconColor} /> : null}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </>
  );

  if (!onPress) {
    return (
      <View testID={testID} style={[styles.chip, containerStyle, style]}>
        {content}
      </View>
    );
  }

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      haptic="selection"
      testID={testID}
      style={[styles.chip, containerStyle, style]}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
});
