import { ChevronLeft, type LucideIcon } from 'lucide-react-native';
import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Rise } from '@/components/ui/rise';
import { colors, fonts } from '@/constants/theme';

export type AuthScreenProps = PropsWithChildren<{
  header?: ReactNode;
  footer?: ReactNode;
  testID?: string;
}>;

export function AuthScreen({ header, footer, testID, children }: AuthScreenProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen} testID={testID}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {header ? <Rise style={styles.header}>{header}</Rise> : null}
          <View style={[styles.body, !header && styles.bodyWithoutHeader]}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export type AuthBackButtonProps = {
  onPress: () => void;
  label?: string;
};

export function AuthBackButton({ onPress, label = 'Voltar' }: AuthBackButtonProps) {
  return <IconButton icon={ChevronLeft} tone="surface" accessibilityLabel={label} onPress={onPress} />;
}

export function AuthBarTitle({ children, size = 'default' }: { children: string; size?: 'default' | 'large' }) {
  return (
    <Text
      accessibilityRole={size === 'large' ? 'header' : undefined}
      numberOfLines={1}
      style={[styles.barTitle, size === 'large' && styles.barTitleLarge]}
    >
      {children}
    </Text>
  );
}

export type AuthIconTileTone = 'default' | 'energy' | 'critical';

export function AuthIconTile({ icon, tone = 'default', index = 0 }: { icon: LucideIcon; tone?: AuthIconTileTone; index?: number }) {
  const toneStyle =
    tone === 'energy'
      ? { backgroundColor: colors.energyTint, color: colors.energyText }
      : tone === 'critical'
        ? { backgroundColor: colors.criticalTint, color: colors.criticalText }
        : { backgroundColor: colors.surfaceCard, color: colors.textTitle };

  return (
    <Rise index={index} style={[styles.iconTile, { backgroundColor: toneStyle.backgroundColor }]}>
      <Icon icon={icon} size={28} color={toneStyle.color} />
    </Rise>
  );
}

export type AuthHeadingProps = {
  title: string;
  subtitle?: ReactNode;
  index?: number;
};

export function AuthHeading({ title, subtitle, index = 1 }: AuthHeadingProps) {
  return (
    <Rise index={index} style={styles.heading}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Rise>
  );
}

export function AuthNote({ children, index = 0 }: { children: ReactNode; index?: number }) {
  return (
    <Rise index={index} style={styles.note}>
      <Text style={styles.noteText}>{children}</Text>
    </Rise>
  );
}

export type AuthFooterLinkProps = {
  text: string;
  linkLabel: string;
  onPress: () => void;
  index?: number;
};

export function AuthFooterLink({ text, linkLabel, onPress, index = 0 }: AuthFooterLinkProps) {
  return (
    <Rise index={index}>
      <Text style={styles.footerText}>
        {text}{' '}
        <Text accessibilityRole="link" style={styles.footerLink} onPress={onPress}>
          {linkLabel}
        </Text>
      </Text>
    </Rise>
  );
}

export const authTextStyles = StyleSheet.create({
  strong: {
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingTop: 11,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
    paddingRight: 20,
  },
  body: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bodyWithoutHeader: {
    paddingTop: 24,
  },
  footer: {
    marginTop: 'auto',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  barTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  barTitleLarge: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.84,
  },
  heading: {
    gap: 4,
    marginBottom: 4,
  },
  iconTile: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderCurve: 'continuous',
    marginTop: 18,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    lineHeight: 35,
    fontFamily: fonts.bold,
    letterSpacing: -0.96,
    color: colors.textTitle,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  footerLink: {
    fontFamily: fonts.bold,
    color: colors.textTitle,
  },
  note: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceCard,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});
