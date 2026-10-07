import { useLogout } from '@/features/auth/api/use-logout';
import { useMe } from '@/features/auth/api/use-me';
import { EmailVerificationBanner } from '@/features/auth/components/email-verification-banner';
import { HomeScreen } from '@/features/home/screens/home-screen';

export default function HomeRoute() {
  const { data: user } = useMe();
  const logoutMutation = useLogout();

  if (!user) return null;

  return (
    <HomeScreen
      user={user}
      onSignOut={() => logoutMutation.mutate()}
      isSigningOut={logoutMutation.isPending}
      banner={user.emailVerified ? null : <EmailVerificationBanner email={user.email} />}
    />
  );
}
