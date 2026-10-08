import { DefaultTheme, type Theme } from 'expo-router';

import { colors } from '@/constants/theme';

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.bgBase,
    card: colors.bgCanvas,
    text: colors.textTitle,
    border: colors.hairline,
    notification: colors.critical,
  },
};
