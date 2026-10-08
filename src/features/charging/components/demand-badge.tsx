import { Sparkles, Timer } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { StatusPill } from '@/components/ui/status-pill';
import { fonts, getColors, type ColorScheme } from '@/constants/theme';
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
  scheme?: ColorScheme;
};

export function DemandBadge({ level, factor, source, modelVersion, scheme = 'light' }: DemandBadgeProps) {
  const tokens = getColors(scheme);

  return (
    <View style={styles.badge}>
      <StatusPill
        status={demandLevelStatus[level]}
        label={`${demandLevelLabels[level]} · ${formatDemandFactor(factor)}`}
        scheme={scheme}
        testID="demand-badge"
      />
      <View style={styles.source}>
        <Icon
          icon={source === 'MODEL' ? Sparkles : Timer}
          size={12}
          color={source === 'MODEL' ? tokens.accentOnQuiet : tokens.textSubtle}
        />
        <Text style={[styles.sourceLabel, { color: tokens.textSubtle }]}>
          {formatDemandSource(source, modelVersion)}
        </Text>
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
  },
});
