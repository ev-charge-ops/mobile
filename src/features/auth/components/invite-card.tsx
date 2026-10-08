import { Building2, CalendarClock, PlugZap, Zap, type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Icon } from '@/components/ui/icon';
import { Rise } from '@/components/ui/rise';
import { colors, fonts, motion } from '@/constants/theme';
import type { InvitePreview } from '@/features/auth/api/auth-api';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 92;
const RING_RADIUS = 44;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const RING_SCALE = RING_SIZE / 96;

const expiryFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' });

export function formatInviteExpiry(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return expiryFormatter.format(date);
}

export type InviteCardProps = {
  invite: InvitePreview;
  eyebrow?: string;
  index?: number;
};

export function InviteCard({ invite, eyebrow = 'Você foi convidado para', index = 1 }: InviteCardProps) {
  return (
    <Rise index={index} style={styles.card}>
      <InviteRing />
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text accessibilityRole="header" style={styles.organization}>
        {invite.organizationName}
      </Text>
      <View style={styles.chips}>
        {invite.unitLabel ? (
          <View style={styles.chip}>
            <Text style={styles.chipStrong}>{`Unidade ${invite.unitLabel}`}</Text>
          </View>
        ) : null}
        <View style={styles.chip}>
          <Text numberOfLines={1} style={styles.chipText}>
            {invite.email}
          </Text>
        </View>
      </View>
    </Rise>
  );
}

function InviteRing() {
  const reduceMotion = useReduceMotion();
  const draw = useSharedValue(reduceMotion ? 1 : 0);
  const node = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      draw.set(1);
      node.set(1);
      return;
    }
    draw.set(withDelay(350, withTiming(1, { duration: 1200, easing: motion.easing.plug })));
    node.set(withDelay(1500, withTiming(1, { duration: 400, easing: motion.easing.out })));
  }, [reduceMotion, draw, node]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: RING_LENGTH * (1 - draw.get()) }));
  const nodeStyle = useAnimatedStyle(() => ({ opacity: node.get(), transform: [{ scale: node.get() }] }));
  const nodeSize = 9 * RING_SCALE;

  return (
    <View style={styles.ring} testID="invite-ring">
      <Svg width={RING_SIZE} height={RING_SIZE} viewBox="0 0 96 96" style={StyleSheet.absoluteFill}>
        <Circle cx={48} cy={48} r={RING_RADIUS} fill="none" stroke={colors.hairline} strokeWidth={3} />
        <AnimatedCircle
          cx={48}
          cy={48}
          r={RING_RADIUS}
          fill="none"
          stroke={colors.energy}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${RING_LENGTH}`}
          animatedProps={ringProps}
          transform="rotate(-90 48 48)"
        />
      </Svg>
      <Animated.View
        style={[
          styles.node,
          { width: nodeSize, height: nodeSize, left: 48 * RING_SCALE - nodeSize / 2, top: 4 * RING_SCALE - nodeSize / 2 },
          nodeStyle,
        ]}
      />
      <View style={styles.ringCenter}>
        <Icon icon={Building2} size={30} color={colors.energyText} />
      </View>
    </View>
  );
}

export function InviteIncluded({ invite, index = 3 }: { invite: InvitePreview; index?: number }) {
  const expiry = formatInviteExpiry(invite.expiresAt);

  return (
    <>
      <Rise index={index}>
        <Text style={styles.sectionTitle}>O que está incluído</Text>
      </Rise>
      <Rise index={index + 1} style={styles.list}>
        <IncludedRow
          icon={PlugZap}
          title="Pontos de recarga do condomínio"
          subtitle={`Garagem de ${invite.organizationName}, pelo app`}
        />
        <IncludedRow
          icon={Zap}
          tone="energy"
          title="Energia a custo"
          subtitle="Repassada sem margem, no rateio mensal"
          last={!expiry}
        />
        {expiry ? (
          <IncludedRow icon={CalendarClock} title="Convite válido" subtitle={`Aceite até ${expiry}`} last />
        ) : null}
      </Rise>
    </>
  );
}

type IncludedRowProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tone?: 'default' | 'energy';
  last?: boolean;
};

function IncludedRow({ icon, title, subtitle, tone = 'default', last = false }: IncludedRowProps) {
  const isEnergy = tone === 'energy';

  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <View style={[styles.rowIcon, isEnergy && styles.rowIconEnergy]}>
        <Icon icon={icon} size={20} color={isEnergy ? colors.energyText : colors.textTitle} />
      </View>
      <View style={styles.rowTexts}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderRadius: 28,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceCard,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  node: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.energy,
  },
  ringCenter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.energyTint,
  },
  eyebrow: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fonts.semibold,
    textAlign: 'center',
    color: colors.textMuted,
  },
  organization: {
    marginTop: 4,
    fontSize: 26,
    lineHeight: 30,
    fontFamily: fonts.bold,
    letterSpacing: -0.78,
    textAlign: 'center',
    color: colors.textTitle,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  chip: {
    maxWidth: '100%',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.surfaceInset,
  },
  chipStrong: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  chipText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: fonts.semibold,
    color: colors.textBody,
  },
  sectionTitle: {
    marginTop: 4,
    paddingHorizontal: 4,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  list: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceCard,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceInset,
  },
  rowIconEnergy: {
    backgroundColor: colors.energyTint,
  },
  rowTexts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  rowSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});
