import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, fonts } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

export type TermsCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

export function TermsCheckbox({ checked, onChange, error }: TermsCheckboxProps) {
  return (
    <View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel="Li e aceito os Termos de uso e a Política de privacidade (LGPD)"
        hitSlop={6}
        onPress={() => {
          haptics.selection();
          onChange(!checked);
        }}
        style={styles.row}
      >
        <View style={[styles.box, checked && styles.boxChecked, Boolean(error) && !checked && styles.boxError]}>
          {checked ? <Icon icon={Check} size={16} strokeWidth={3} color={colors.textOnEnergy} /> : null}
        </View>
        <Text style={styles.text}>
          Li e aceito os <Text style={styles.strong}>Termos de uso</Text> e a{' '}
          <Text style={styles.strong}>Política de privacidade</Text> (LGPD).
        </Text>
      </Pressable>
      {error && !checked ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 2,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    borderColor: colors.energy,
    backgroundColor: colors.energy,
  },
  boxError: {
    borderColor: colors.borderDanger,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textBody,
  },
  strong: {
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.criticalText,
    marginTop: 6,
    marginLeft: 34,
  },
});
