import { Link, type Href } from 'expo-router';
import { StyleSheet } from 'react-native';

import { colors, fonts, typography } from '@/constants/theme';

export type AuthLinkProps = {
  href: Href;
  label: string;
};

export function AuthLink({ href, label }: AuthLinkProps) {
  return (
    <Link href={href} style={styles.link}>
      {label}
    </Link>
  );
}

const styles = StyleSheet.create({
  link: {
    ...typography.label,
    fontFamily: fonts.bold,
    color: colors.textLink,
    alignSelf: 'center',
  },
});
