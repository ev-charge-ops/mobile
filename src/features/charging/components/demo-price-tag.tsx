import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { fonts, getColors, radii, spacing, type ColorScheme } from '@/constants/theme';

export type DemoPriceTagProps = {
  scheme?: ColorScheme;
  style?: StyleProp<ViewStyle>;
};

export function DemoPriceTag({ scheme = 'light', style }: DemoPriceTagProps) {
  const tokens = getColors(scheme);

  return (
    <View testID="demo-price-tag" style={[styles.tag, { backgroundColor: tokens.infoTint }, style]}>
      <Text style={[styles.label, { color: tokens.infoText }]}>Preço de demonstração</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
});
