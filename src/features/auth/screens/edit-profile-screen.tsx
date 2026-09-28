import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/app-bar';
import { FadeInItem } from '@/components/ui/fade-in-item';
import { useToast } from '@/components/ui/toast';
import { colors, fonts, spacing } from '@/constants/theme';
import type { AuthUser } from '@/features/auth/api/auth-api';
import { useUpdateProfile } from '@/features/auth/api/use-update-profile';
import { getUpdateProfileErrorMessage } from '@/features/auth/auth-errors';
import type { ProfileValues } from '@/features/auth/auth-schemas';
import { ProfileForm } from '@/features/auth/components/profile-form';

export type EditProfileScreenProps = {
  user: AuthUser;
  onBack: () => void;
  onDone: () => void;
};

export function EditProfileScreen({ user, onBack, onDone }: EditProfileScreenProps) {
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  const save = ({ name }: ProfileValues) =>
    updateProfile.mutate(
      { name },
      {
        onSuccess: () => {
          toast.show('Dados atualizados');
          onDone();
        },
      },
    );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <AppBar title="Dados pessoais" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FadeInItem>
          <Text style={styles.subtitle}>Seu nome aparece no app, nos recibos e para o gestor do condomínio.</Text>
        </FadeInItem>
        <FadeInItem index={1}>
          <ProfileForm
            name={user.name}
            email={user.email}
            onSubmit={save}
            isSubmitting={updateProfile.isPending}
            errorMessage={updateProfile.isError ? getUpdateProfileErrorMessage(updateProfile.error) : null}
          />
        </FadeInItem>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  content: {
    gap: spacing.xl,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.massive,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textSubtle,
  },
});
