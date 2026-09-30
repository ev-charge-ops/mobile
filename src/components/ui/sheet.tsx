import { useEffect, useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { getColors, motion, radii, shadows, spacing, type ColorScheme } from '@/constants/theme';

export type SheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  closeLabel?: string;
  scheme?: ColorScheme;
}>;

const DISMISS_DISTANCE = 90;
const DISMISS_VELOCITY = 700;
const PAN_ACTIVATION = 12;

export function Sheet({ visible, onClose, closeLabel = 'Fechar', scheme = 'light', children }: SheetProps) {
  const tokens = getColors(scheme);
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(screenHeight);
  const scrimOpacity = useSharedValue(0);

  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      translateY.set(withTiming(0, { duration: motion.duration.sheet, easing: motion.easing.sheet }));
      scrimOpacity.set(withTiming(1, { duration: motion.duration.sheet, easing: motion.easing.out }));
      return;
    }
    translateY.set(
      withTiming(screenHeight, { duration: motion.duration.slow, easing: motion.easing.in }, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      }),
    );
    scrimOpacity.set(withTiming(0, { duration: motion.duration.slow, easing: motion.easing.in }));
  }, [visible, screenHeight, translateY, scrimOpacity]);

  const pan = Gesture.Pan()
    .activeOffsetY(PAN_ACTIVATION)
    .failOffsetX([-PAN_ACTIVATION, PAN_ACTIVATION])
    .onUpdate((event) => {
      translateY.set(Math.max(0, event.translationY));
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        scheduleOnRN(onClose);
      } else {
        translateY.set(withTiming(0, { duration: motion.duration.fast, easing: motion.easing.out }));
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrimOpacity.get() }));

  if (!mounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.passThrough]}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: tokens.surfaceScrim }, scrimStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
      </Animated.View>
      <View style={[styles.anchor, styles.passThrough]}>
        <GestureDetector gesture={pan}>
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                backgroundColor: tokens.surfaceSheet,
                boxShadow: scheme === 'night' ? shadows.sheetNight : shadows.sheet,
                paddingBottom: insets.bottom + spacing.xl,
              },
              sheetStyle,
            ]}
          >
            <View style={[styles.grabber, { backgroundColor: tokens.borderSubtle }]} />
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  passThrough: {
    pointerEvents: 'box-none',
  },
  anchor: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.xl,
    paddingTop: 10,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
});
