import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeInUp,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, fonts, motion } from '@/constants/theme';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

export type CodeInputProps = {
  length: number;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  error?: string;
  autoFocus?: boolean;
  label?: string;
};

function boxEntering(index: number) {
  return FadeInUp.withInitialValues({ opacity: 0, transform: [{ translateY: 10 }] })
    .duration(500)
    .delay(160 + index * 40)
    .easing(motion.easing.out)
    .reduceMotion(ReduceMotion.System);
}

export function CodeInput({
  length,
  value,
  onChangeText,
  onBlur,
  onSubmitEditing,
  error,
  autoFocus = false,
  label = 'Código',
}: CodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(autoFocus);
  const activeIndex = Math.min(value.length, length - 1);
  const filled = value.length;

  return (
    <View>
      <Pressable
        accessible={false}
        onPress={() => inputRef.current?.focus()}
        style={styles.row}
      >
        {Array.from({ length }, (_, index) => {
          const digit = value[index] ?? '';
          const isActive = focused && index === activeIndex && filled < length;
          return (
            <Animated.View
              key={index}
              entering={boxEntering(index)}
              style={[styles.box, isActive && styles.boxActive, Boolean(error) && styles.boxError]}
            >
              {digit ? <Text style={styles.digit}>{digit}</Text> : isActive ? <Caret /> : null}
            </Animated.View>
          );
        })}
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          accessibilityHint={`${filled} de ${length} dígitos preenchidos`}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          returnKeyType="go"
          maxLength={length + 8}
          caretHidden
          style={styles.hiddenInput}
        />
      </Pressable>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function Caret() {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      opacity.set(1);
      return;
    }
    opacity.set(
      withRepeat(
        withSequence(withTiming(1, { duration: 525 }), withTiming(0, { duration: 0 }), withTiming(0, { duration: 525 })),
        -1,
      ),
    );
  }, [opacity, reduceMotion]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return <Animated.View style={[styles.caret, style]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  box: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surfaceCard,
  },
  boxActive: {
    borderColor: colors.energy,
    boxShadow: '0 0 0 4px rgba(31,157,87,0.18)',
  },
  boxError: {
    borderColor: colors.borderDanger,
  },
  digit: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fonts.mono,
    color: colors.textTitle,
  },
  caret: {
    width: 2,
    height: 28,
    borderRadius: 2,
    backgroundColor: colors.energy,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0,
    color: 'transparent',
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.criticalText,
    marginTop: 8,
  },
});
