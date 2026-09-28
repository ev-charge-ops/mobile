import { router } from 'expo-router';

import { LoadingScreen } from '@/components/ui/loading-screen';
import { useMe } from '@/features/auth/api/use-me';
import { EditProfileScreen } from '@/features/auth/screens/edit-profile-screen';

export default function ProfileRoute() {
  const meQuery = useMe();

  if (!meQuery.data) return <LoadingScreen label="Carregando seus dados" />;

  return <EditProfileScreen user={meQuery.data} onBack={() => router.back()} onDone={() => router.back()} />;
}
