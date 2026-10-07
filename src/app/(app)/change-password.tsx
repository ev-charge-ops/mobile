import { router } from 'expo-router';

import { LoadingScreen } from '@/components/ui/loading-screen';
import { useMe } from '@/features/auth/api/use-me';
import { ChangePasswordScreen } from '@/features/auth/screens/change-password-screen';

export default function ChangePasswordRoute() {
  const meQuery = useMe();

  if (!meQuery.data) return <LoadingScreen label="Carregando sua conta" />;

  return (
    <ChangePasswordScreen
      hasPassword={meQuery.data.hasPassword}
      onBack={() => router.back()}
      onDone={() => router.back()}
    />
  );
}
