import { router } from 'expo-router';

import { LoadingScreen } from '@/components/ui/loading-screen';
import { useMyOrganizations } from '@/features/account/api/use-my-organizations';
import { formatUnitSubtitle } from '@/features/account/unit-subtitle';
import { useMe } from '@/features/auth/api/use-me';
import { EditProfileScreen } from '@/features/auth/screens/edit-profile-screen';

export default function ProfileRoute() {
  const meQuery = useMe();
  const organizationsQuery = useMyOrganizations();

  if (!meQuery.data) return <LoadingScreen label="Carregando seus dados" />;

  return (
    <EditProfileScreen
      user={meQuery.data}
      membership={formatUnitSubtitle(organizationsQuery.data)}
      onBack={() => router.back()}
      onDone={() => router.back()}
    />
  );
}
