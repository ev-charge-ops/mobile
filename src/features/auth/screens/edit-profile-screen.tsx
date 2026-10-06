import { StyleSheet, Text } from 'react-native';

import { Rise } from '@/components/ui/rise';
import { useToast } from '@/components/ui/toast';
import { colors, fonts } from '@/constants/theme';
import type { AuthUser } from '@/features/auth/api/auth-api';
import { useUpdateProfile } from '@/features/auth/api/use-update-profile';
import { getUpdateProfileErrorMessage } from '@/features/auth/auth-errors';
import type { ProfileValues } from '@/features/auth/auth-schemas';
import { AuthBackButton, AuthBarTitle, AuthScreen } from '@/features/auth/components/auth-screen';
import { ProfileForm } from '@/features/auth/components/profile-form';

export type EditProfileScreenProps = {
  user: AuthUser;
  membership?: string | null;
  onBack: () => void;
  onDone: () => void;
};

export function getProfileInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';
  return `${first}${last}`.toLocaleUpperCase('pt-BR');
}

export function EditProfileScreen({ user, membership, onBack, onDone }: EditProfileScreenProps) {
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  const save = ({ name }: ProfileValues) =>
    updateProfile.mutate(
      { name },
      {
        onSuccess: () => {
          toast.show('Alterações salvas');
          onDone();
        },
      },
    );

  return (
    <AuthScreen
      header={
        <>
          <AuthBackButton onPress={onBack} />
          <AuthBarTitle size="large">Perfil</AuthBarTitle>
        </>
      }
    >
      <Rise index={1} style={styles.avatar}>
        <Text accessibilityLabel={`Iniciais de ${user.name}`} style={styles.initials}>
          {getProfileInitials(user.name)}
        </Text>
      </Rise>
      <ProfileForm
        name={user.name}
        email={user.email}
        emailVerified={user.emailVerified}
        membership={membership}
        onSubmit={save}
        isSubmitting={updateProfile.isPending}
        errorMessage={updateProfile.isError ? getUpdateProfileErrorMessage(updateProfile.error) : null}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 14,
    backgroundColor: colors.surfaceInverse,
  },
  initials: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: fonts.bold,
    letterSpacing: -0.64,
    color: colors.textOnInverse,
  },
});
