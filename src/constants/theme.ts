import type { TextStyle } from 'react-native';
import { Easing } from 'react-native-reanimated';

export const palette = {
  neutral1000: '#000000',
  neutral950: '#0B0B0D',
  neutral900: '#121214',
  neutral850: '#17171A',
  neutral800: '#1C1C1F',
  neutral750: '#212125',
  neutral700: '#26262A',
  neutral600: '#303036',
  neutral500: '#3D3D44',
  neutral400: '#57575E',
  neutral300: '#7C7C84',
  neutral200: '#B4B4BA',
  neutral100: '#DEDEE2',
  neutral0: '#FFFFFF',
  red700: '#9E0014',
  red600: '#C10015',
  red500: '#E8121F',
  red400: '#FF3B45',
  red300: '#FF7A80',
  green500: '#26D07C',
  green400: '#4FE09B',
  amber500: '#F5A623',
  blue500: '#4A90E2',
  blue400: '#6BA9EE',
  violet500: '#8E7BE8',
} as const;

export const colors = {
  bgBase: palette.neutral950,
  bgCanvas: palette.neutral900,
  surfaceCard: palette.neutral800,
  surfaceInset: palette.neutral700,
  surfaceRaised: palette.neutral600,
  surfaceNav: 'rgba(18,18,20,0.86)',
  surfaceSheet: palette.neutral850,
  surfaceScrim: 'rgba(0,0,0,0.62)',

  textTitle: palette.neutral0,
  textBody: palette.neutral100,
  textMuted: palette.neutral200,
  textSubtle: palette.neutral300,
  textDisabled: palette.neutral400,
  textOnAccent: palette.neutral0,
  textLink: palette.red400,

  hairline: 'rgba(255,255,255,0.07)',
  borderSubtle: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,255,255,0.26)',
  borderDashed: 'rgba(255,255,255,0.18)',
  borderDanger: 'rgba(232,18,31,0.40)',
  focusRing: 'rgba(232,18,31,0.55)',

  accent: palette.red500,
  accentHover: palette.red400,
  accentPress: palette.red600,
  accentQuiet: 'rgba(232,18,31,0.14)',
  accentOnQuiet: palette.red400,

  statusCharging: palette.green500,
  statusChargingBg: 'rgba(38,208,124,0.14)',
  statusIdle: palette.amber500,
  statusIdleBg: 'rgba(245,166,35,0.14)',
  statusFault: palette.red400,
  statusFaultBg: 'rgba(232,18,31,0.14)',
  statusInfo: palette.blue500,
  statusInfoBg: 'rgba(74,144,226,0.16)',
  statusOffline: palette.neutral300,
  statusOfflineBg: 'rgba(255,255,255,0.08)',

  meterTrack: 'rgba(255,255,255,0.10)',
  meterEnergy: palette.green500,
  meterDemand: palette.amber500,
  meterOver: palette.red400,

  controlTrackOff: palette.neutral600,
  controlTrackOn: palette.red500,
  controlKnob: palette.neutral0,
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
  massive: 64,
  gutter: 16,
  cardPadding: 16,
  cardGap: 12,
  tabBarHeight: 64,
  appBarHeight: 56,
  hitTarget: 44,
} as const;

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
  card: 16,
  tile: 14,
  input: 12,
  sheet: 20,
} as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: fonts.extrabold, letterSpacing: -0.4, color: colors.textTitle },
  title: { fontSize: 24, lineHeight: 30, fontFamily: fonts.extrabold, letterSpacing: -0.2, color: colors.textTitle },
  heading: { fontSize: 19, lineHeight: 26, fontFamily: fonts.bold, color: colors.textTitle },
  subtitle: { fontSize: 17, lineHeight: 24, fontFamily: fonts.semibold, color: colors.textTitle },
  body: { fontSize: 15, lineHeight: 22, fontFamily: fonts.regular, color: colors.textBody },
  label: { fontSize: 14, lineHeight: 20, fontFamily: fonts.semibold, color: colors.textBody },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.medium, color: colors.textSubtle },
  micro: { fontSize: 11, lineHeight: 14, fontFamily: fonts.semibold, color: colors.textSubtle },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: fonts.extrabold,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  mono: { fontSize: 13, lineHeight: 18, fontFamily: fonts.mono, color: colors.textBody },
} as const satisfies Record<string, TextStyle>;

export const motion = {
  duration: {
    instant: 80,
    fast: 140,
    base: 200,
    slow: 320,
    sheet: 280,
  },
  easing: {
    standard: Easing.bezier(0.2, 0, 0.2, 1),
    out: Easing.bezier(0, 0, 0.2, 1),
    in: Easing.bezier(0.4, 0, 1, 1),
    sheet: Easing.bezier(0.16, 1, 0.3, 1),
  },
  pressScale: 0.97,
} as const;
