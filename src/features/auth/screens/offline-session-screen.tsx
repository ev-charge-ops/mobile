import { useState } from 'react';

import { ErrorScreen } from '@/components/ui/error-screen';
import { useLogout } from '@/features/auth/api/use-logout';
import { useSession } from '@/features/auth/session/session-context';

export function OfflineSessionScreen() {
  const { retryRestore } = useSession();
  const logoutMutation = useLogout();
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = async () => {
    setIsRetrying(true);
    try {
      await retryRestore();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <ErrorScreen
      title="Sem conexão"
      message="Não foi possível conectar ao servidor para restaurar sua sessão. Verifique sua internet e tente novamente."
      onRetry={retry}
      isRetrying={isRetrying}
      onSignOut={() => logoutMutation.mutate()}
      isSigningOut={logoutMutation.isPending}
    />
  );
}
