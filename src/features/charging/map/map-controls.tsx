import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LocateFixed, Minus, Plus, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { nightColors, radii } from '@/constants/theme';

const GLASS_TINT = 'rgba(38,40,44,0.8)';

export function GlassSurface({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const hasGlass = isLiquidGlassAvailable();

  return (
    <View style={[styles.glass, !hasGlass && { backgroundColor: GLASS_TINT }, style]}>
      {hasGlass ? (
        <GlassView
          glassEffectStyle="regular"
          colorScheme="dark"
          tintColor={GLASS_TINT}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {children}
    </View>
  );
}

type ControlProps = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
};

function Control({ icon, label, onPress }: ControlProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      haptic="selection"
      scaleTo={0.9}
      style={styles.control}
    >
      <Icon icon={icon} size={20} color={nightColors.textTitle} />
    </PressableScale>
  );
}

export type MapControlsProps = {
  locateLabel: string;
  onLocate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  style?: StyleProp<ViewStyle>;
};

export function MapControls({ locateLabel, onLocate, onZoomIn, onZoomOut, style }: MapControlsProps) {
  return (
    <GlassSurface style={[styles.stack, style]}>
      <Control icon={LocateFixed} label={locateLabel} onPress={onLocate} />
      <Control icon={Plus} label="Aproximar" onPress={onZoomIn} />
      <Control icon={Minus} label="Afastar" onPress={onZoomOut} />
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  glass: {
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  stack: {
    width: 52,
    alignItems: 'center',
    paddingVertical: 6,
  },
  control: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
