import { DarkTheme, type Theme } from 'expo-router';

import { colors } from '@/constants/theme';

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.bgBase,
    card: colors.bgCanvas,
    text: colors.textTitle,
    border: colors.hairline,
    notification: colors.accent,
  },
};
