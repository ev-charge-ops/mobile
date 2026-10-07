import { LoadingScreen } from '@/components/ui/loading-screen';
import { AccountScreen } from '@/features/account/screens/account-screen';
import { useLogout } from '@/features/auth/api/use-logout';
import { useMe } from '@/features/auth/api/use-me';
import { EmailVerificationBanner } from '@/features/auth/components/email-verification-banner';
import { SignedInErrorScreen } from '@/features/auth/screens/signed-in-error-screen';

export default function AccountRoute() {
  const meQuery = useMe();
  const logoutMutation = useLogout();
  const user = meQuery.data;

  if (user) {
    return (
      <AccountScreen
        user={user}
        onSignOut={() => logoutMutation.mutate()}
        isSigningOut={logoutMutation.isPending}
        banner={user.emailVerified ? null : <EmailVerificationBanner email={user.email} />}
      />
    );
  }

  if (meQuery.isError) {
    return (
      <SignedInErrorScreen
        message="Não foi possível carregar sua conta. Verifique sua conexão e tente novamente."
        onRetry={() => meQuery.refetch()}
        isRetrying={meQuery.isFetching}
      />
    );
  }

  return <LoadingScreen label="Carregando sua conta" />;
}
