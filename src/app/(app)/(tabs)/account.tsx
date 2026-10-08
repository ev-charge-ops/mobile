import { useState } from 'react';

import { LoadingScreen } from '@/components/ui/loading-screen';
import { AccountScreen } from '@/features/account/screens/account-screen';
import { useLogout } from '@/features/auth/api/use-logout';
import { useMe } from '@/features/auth/api/use-me';
import { EmailVerificationBanner } from '@/features/auth/components/email-verification-banner';
import { SignedInErrorScreen } from '@/features/auth/screens/signed-in-error-screen';
import { useMyStatement } from '@/features/charging/api/use-my-statement';
import { getCurrentMonth } from '@/features/charging/history-month';

export default function AccountRoute() {
  const meQuery = useMe();
  const logoutMutation = useLogout();
  const [month] = useState(() => getCurrentMonth(Date.now()));
  const { data: statement } = useMyStatement(month);
  const user = meQuery.data;

  if (user) {
    return (
      <AccountScreen
        user={user}
        onSignOut={() => logoutMutation.mutate()}
        isSigningOut={logoutMutation.isPending}
        banner={user.emailVerified ? null : <EmailVerificationBanner email={user.email} />}
        monthSummary={statement ? { energyKwh: statement.energyKwh, totalCents: statement.totalCents } : null}
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
