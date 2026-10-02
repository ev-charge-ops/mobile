import { useState } from 'react';
import { StyleSheet, View, type AccessibilityActionEvent, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { getColors, radii, shadows, type ColorScheme } from '@/constants/theme';

const THUMB_SIZE = 26;
const TRACK_HEIGHT = 6;
const HIT_HEIGHT = 44;
const PAN_ACTIVATION = 3;
const PAN_FAIL = 12;

export type SliderProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
  valueText?: string;
  scheme?: ColorScheme;
  fillColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function snapSliderValue(raw: number, min: number, max: number, step: number) {
  'worklet';
  const snapped = Math.round((raw - min) / step) * step + min;
  return Math.max(min, Math.min(max, Number(snapped.toFixed(6))));
}

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  accessibilityLabel,
  valueText,
  scheme = 'light',
  fillColor,
  style,
  testID,
}: SliderProps) {
  const tokens = getColors(scheme);
  const [width, setWidth] = useState(0);
  const last = useSharedValue(value);
  const span = Math.max(step, max - min);
  const ratio = Math.max(0, Math.min(1, (value - min) / span));
  const usable = Math.max(0, width - THUMB_SIZE);

  const emit = (next: number) => {
    if (next !== value) onChange(next);
  };

  const pickAt = (x: number) => {
    'worklet';
    if (usable <= 0) return;
    const position = Math.max(0, Math.min(usable, x - THUMB_SIZE / 2));
    const next = snapSliderValue(min + (position / usable) * span, min, max, step);
    if (next === last.get()) return;
    last.set(next);
    scheduleOnRN(emit, next);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-PAN_ACTIVATION, PAN_ACTIVATION])
    .failOffsetY([-PAN_FAIL, PAN_FAIL])
    .onStart((event) => {
      last.set(value);
      pickAt(event.x);
    })
    .onUpdate((event) => pickAt(event.x));
  const tap = Gesture.Tap().onEnd((event) => {
    last.set(value);
    pickAt(event.x);
  });
  const gesture = Gesture.Race(pan, tap);

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    const direction = event.nativeEvent.actionName === 'increment' ? 1 : -1;
    emit(snapSliderValue(value + direction * step, min, max, step));
  };

  return (
    <GestureDetector gesture={gesture}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value, text: valueText }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={onAccessibilityAction}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        testID={testID}
        style={[styles.hit, style]}
      >
        <View style={[styles.track, { backgroundColor: tokens.meterTrack }]}>
          <View
            style={[
              styles.fill,
              { width: THUMB_SIZE / 2 + ratio * usable, backgroundColor: fillColor ?? tokens.energy },
            ]}
          />
        </View>
        <View
          pointerEvents="none"
          style={[styles.thumb, { left: ratio * usable, backgroundColor: tokens.controlKnob }]}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hit: {
    height: HIT_HEIGHT,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: TRACK_HEIGHT,
    borderRadius: radii.pill,
  },
  thumb: {
    position: 'absolute',
    top: (HIT_HEIGHT - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    boxShadow: shadows.knob,
  },
});
