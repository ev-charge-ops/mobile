import { Link, type Href } from 'expo-router';
import { Zap } from 'lucide-react-native';
import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { colors, fonts, radii, spacing, typography } from '@/constants/theme';

export type AuthLayoutProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerHref: Href;
}>;

export function AuthLayout({ title, subtitle, footerText, footerLinkLabel, footerHref, children }: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.badge}>
              <Icon icon={Zap} size={26} color={colors.textOnAccent} />
            </View>
            <Text style={styles.brand}>EV ChargeOps</Text>
            <Text accessibilityRole="header" style={typography.title}>
              {title}
            </Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {children}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{footerText}</Text>
            <Link href={footerHref} replace style={styles.footerLink}>
              {footerLinkLabel}
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xxl,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xxxl,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  header: {
    gap: spacing.sm,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    marginBottom: spacing.sm,
  },
  brand: {
    ...typography.eyebrow,
    color: colors.accentOnQuiet,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  footerText: {
    ...typography.label,
    color: colors.textSubtle,
  },
  footerLink: {
    ...typography.label,
    fontFamily: fonts.bold,
    color: colors.textLink,
  },
});
