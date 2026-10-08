import { Bell, CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { createContext, use, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInUp, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, motion, nightColors, radii, shadows, spacing } from '@/constants/theme';

export type ToastTone = 'success' | 'info' | 'warning' | 'error' | 'neutral';

export type ToastOptions = {
  tone?: ToastTone;
  duration?: number;
  title?: string;
  icon?: LucideIcon;
  onPress?: () => void;
};

type ToastState = {
  id: number;
  message: string;
  tone: ToastTone;
  title?: string;
  icon?: LucideIcon;
  onPress?: () => void;
};

type ToastContextValue = {
  show: (message: string, options?: ToastOptions) => void;
  hide: () => void;
};

const DEFAULT_DURATION = 2600;
const DISMISS_DISTANCE = 24;
const DISMISS_VELOCITY = 600;
const PAN_ACTIVATION = 8;

const toneStyles: Record<ToastTone, { icon: LucideIcon; color: string; backgroundColor: string }> = {
  success: { icon: CircleCheck, color: nightColors.energy, backgroundColor: nightColors.energyTint },
  info: { icon: Info, color: nightColors.info, backgroundColor: nightColors.infoTint },
  warning: { icon: TriangleAlert, color: nightColors.warning, backgroundColor: nightColors.warningTint },
  error: { icon: CircleAlert, color: nightColors.critical, backgroundColor: nightColors.criticalTint },
  neutral: { icon: Bell, color: nightColors.textMuted, backgroundColor: nightColors.statusOfflineBg },
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextIdRef = useRef(0);

  const clearTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const hide = () => {
    clearTimer();
    setToast(null);
  };

  const show = (
    message: string,
    { tone = 'success', duration = DEFAULT_DURATION, title, icon, onPress }: ToastOptions = {},
  ) => {
    clearTimer();
    nextIdRef.current += 1;
    setToast({ id: nextIdRef.current, message, tone, title, icon, onPress });
    timeoutRef.current = setTimeout(() => setToast(null), duration);
  };

  useEffect(() => clearTimer, []);

  return (
    <ToastContext value={{ show, hide }}>
      {children}
      <ToastHost toast={toast} onDismiss={hide} />
    </ToastContext>
  );
}

export function useToast() {
  const context = use(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

function ToastHost({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.host, { top: insets.top + spacing.sm }]}>
      {toast && <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />}
    </View>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  const translateY = useSharedValue(0);
  const tone = toneStyles[toast.tone];
  const isRich = toast.title != null;

  const handlePress = () => {
    onDismiss();
    toast.onPress?.();
  };

  const pan = Gesture.Pan()
    .withTestId('toast-pan')
    .activeOffsetY([-PAN_ACTIVATION, PAN_ACTIVATION])
    .onUpdate((event) => {
      translateY.set(Math.min(0, event.translationY));
    })
    .onEnd((event) => {
      if (event.translationY < -DISMISS_DISTANCE || event.velocityY < -DISMISS_VELOCITY) {
        scheduleOnRN(onDismiss);
      } else {
        translateY.set(withTiming(0, { duration: motion.duration.fast, easing: motion.easing.out }));
      }
    });

  const dragStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));

  return (
    <Animated.View
      entering={FadeInUp.duration(motion.duration.sheet)}
      exiting={FadeOutUp.duration(motion.duration.fast)}
    >
      <GestureDetector gesture={pan}>
        <Animated.View style={dragStyle}>
          <Pressable
            testID="toast"
            accessibilityRole={toast.onPress ? 'button' : 'alert'}
            accessibilityLiveRegion="polite"
            accessibilityLabel={isRich ? `${toast.title}. ${toast.message}` : toast.message}
            accessibilityHint={toast.onPress ? 'Toque para abrir' : undefined}
            onPress={handlePress}
            style={({ pressed }) => [styles.toast, isRich && styles.richToast, pressed && styles.pressed]}
          >
            {isRich ? (
              <View style={[styles.badge, { backgroundColor: tone.backgroundColor }]}>
                <Icon icon={toast.icon ?? tone.icon} size={18} color={tone.color} />
              </View>
            ) : (
              <Icon icon={toast.icon ?? tone.icon} size={20} color={tone.color} />
            )}
            <View style={styles.content}>
              {isRich && (
                <Text style={styles.title} numberOfLines={1}>
                  {toast.title}
                </Text>
              )}
              <Text style={isRich ? styles.body : styles.message} numberOfLines={isRich ? 2 : undefined}>
                {toast.message}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    zIndex: 40,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceInverse,
    boxShadow: shadows.floatingStrong,
  },
  richToast: {
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    borderRadius: radii.card,
  },
  pressed: {
    transform: [{ scale: motion.pressScale }],
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  message: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.semibold,
    color: colors.textOnInverse,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.bold,
    color: colors.textOnInverse,
  },
  body: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fonts.medium,
    color: nightColors.textMuted,
  },
});
