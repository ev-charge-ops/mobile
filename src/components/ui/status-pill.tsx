import { BatteryCharging, Clock, Info, Plug, TriangleAlert, Zap, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, radii } from '@/constants/theme';

export type Status = 'available' | 'charging' | 'idle' | 'fault' | 'info' | 'offline';

export type StatusPillProps = {
  label: string;
  status?: Status;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

type StatusStyle = {
  color: string;
  backgroundColor: string;
  icon: LucideIcon;
};

const statusStyles: Record<Status, StatusStyle> = {
  available: { color: colors.statusCharging, backgroundColor: colors.statusChargingBg, icon: Zap },
  charging: { color: colors.statusCharging, backgroundColor: colors.statusChargingBg, icon: BatteryCharging },
  idle: { color: colors.statusIdle, backgroundColor: colors.statusIdleBg, icon: Clock },
  fault: { color: colors.statusFault, backgroundColor: colors.statusFaultBg, icon: TriangleAlert },
  info: { color: colors.statusInfo, backgroundColor: colors.statusInfoBg, icon: Info },
  offline: { color: colors.statusOffline, backgroundColor: colors.statusOfflineBg, icon: Plug },
};

export function StatusPill({ label, status = 'info', icon, style, testID }: StatusPillProps) {
  const statusStyle = statusStyles[status];

  return (
    <View testID={testID} style={[styles.pill, { backgroundColor: statusStyle.backgroundColor }, style]}>
      <Icon icon={icon ?? statusStyle.icon} size={12} color={statusStyle.color} strokeWidth={2.4} />
      <Text style={[styles.label, { color: statusStyle.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
});
