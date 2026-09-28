import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TextField, type TextFieldProps } from '@/components/ui/text-field';
import { colors } from '@/constants/theme';

export type PasswordFieldProps = Omit<TextFieldProps, 'secureTextEntry' | 'trailing'>;

export function PasswordField({ icon = Lock, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const toggleLabel = props.label ? `${visible ? 'Ocultar' : 'Mostrar'} ${props.label.toLowerCase()}` : undefined;

  return (
    <TextField
      {...props}
      icon={icon}
      secureTextEntry={!visible}
      autoCorrect={false}
      trailing={
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={toggleLabel ?? (visible ? 'Ocultar senha' : 'Mostrar senha')}
          haptic="selection"
          hitSlop={8}
          scaleTo={0.9}
          onPress={() => setVisible((current) => !current)}
          style={styles.toggle}
        >
          <Icon icon={visible ? EyeOff : Eye} size={18} color={colors.textSubtle} />
        </PressableScale>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -6,
  },
});
