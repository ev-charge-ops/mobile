import { Search, X } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, radii } from '@/constants/theme';

export type ChargePointSearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function ChargePointSearchField({ value, onChangeText }: ChargePointSearchFieldProps) {
  return (
    <View style={styles.field}>
      <Icon icon={Search} size={18} color={colors.textMuted} />
      <TextInput
        accessibilityLabel="Buscar ponto"
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar ponto ou garagem"
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" hitSlop={8} onPress={() => onChangeText('')}>
          <Icon icon={X} size={17} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceCard,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textTitle,
  },
});
