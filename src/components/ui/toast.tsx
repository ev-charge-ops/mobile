import { CircleAlert, CircleCheck, Info, type LucideIcon } from 'lucide-react-native';
import { createContext, use, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, motion, nightColors, radii, shadows, spacing } from '@/constants/theme';

export type ToastTone = 'success' | 'info' | 'error';

export type ToastOptions = {
  tone?: ToastTone;
  duration?: number;
};

type ToastState = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  show: (message: string, options?: ToastOptions) => void;
  hide: () => void;
};

const DEFAULT_DURATION = 2600;

const toneStyles: Record<ToastTone, { icon: LucideIcon; color: string }> = {
  success: { icon: CircleCheck, color: nightColors.energy },
  info: { icon: Info, color: nightColors.info },
  error: { icon: CircleAlert, color: nightColors.critical },
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

  const show = (message: string, { tone = 'success', duration = DEFAULT_DURATION }: ToastOptions = {}) => {
    clearTimer();
    nextIdRef.current += 1;
    setToast({ id: nextIdRef.current, message, tone });
    timeoutRef.current = setTimeout(() => setToast(null), duration);
  };

  useEffect(() => clearTimer, []);

  return (
    <ToastContext value={{ show, hide }}>
      {children}
      <ToastHost toast={toast} />
    </ToastContext>
  );
}

export function useToast() {
  const context = use(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

function ToastHost({ toast }: { toast: ToastState | null }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.host, { top: insets.top + spacing.sm }]}>
      {toast && (
        <Animated.View
          key={toast.id}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          entering={FadeInUp.duration(motion.duration.sheet)}
          exiting={FadeOutUp.duration(motion.duration.fast)}
          style={styles.toast}
        >
          <Icon icon={toneStyles[toast.tone].icon} size={20} color={toneStyles[toast.tone].color} />
          <Text style={styles.message}>{toast.message}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    zIndex: 40,
    pointerEvents: 'none',
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
  message: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.semibold,
    color: colors.textOnInverse,
  },
});
