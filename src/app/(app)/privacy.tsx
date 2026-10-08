import { router } from 'expo-router';

import { useDeletedAccountSignOut } from '@/features/auth/api/use-deleted-account-sign-out';
import { useMe } from '@/features/auth/api/use-me';
import { ConsentScreen } from '@/features/privacy/screens/consent-screen';

export default function PrivacyRoute() {
  const { data: user } = useMe();
  const signOutDeletedAccount = useDeletedAccountSignOut();

  return (
    <ConsentScreen
      mode="settings"
      hasPassword={user?.hasPassword ?? true}
      onBack={() => router.back()}
      onDone={() => router.back()}
      onAccountDeleted={signOutDeletedAccount}
    />
  );
}
