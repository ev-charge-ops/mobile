import { Sparkles, Timer } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { StatusPill } from '@/components/ui/status-pill';
import { colors, fonts } from '@/constants/theme';
import type { DemandFactorSource, DemandLevel } from '@/features/charging/api/charging-api';
import {
  demandLevelLabels,
  demandLevelStatus,
  formatDemandFactor,
  formatDemandSource,
} from '@/features/charging/charging-format';

export type DemandBadgeProps = {
  level: DemandLevel;
  factor: number;
  source: DemandFactorSource;
  modelVersion: string | null;
};

export function DemandBadge({ level, factor, source, modelVersion }: DemandBadgeProps) {
  return (
    <View style={styles.badge}>
      <StatusPill
        status={demandLevelStatus[level]}
        label={`${demandLevelLabels[level]} · ${formatDemandFactor(factor)}`}
        testID="demand-badge"
      />
      <View style={styles.source}>
        <Icon
          icon={source === 'MODEL' ? Sparkles : Timer}
          size={12}
          color={source === 'MODEL' ? colors.accentOnQuiet : colors.textSubtle}
        />
        <Text style={styles.sourceLabel}>{formatDemandSource(source, modelVersion)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  source: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceLabel: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textSubtle,
  },
});
