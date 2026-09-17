import { useMutation } from '@tanstack/react-query';

import { verifyEmailLogin } from '@/features/auth/api/auth-api';
import { useSession } from '@/features/auth/session/session-context';

export function useVerifyEmailLogin() {
  const { startSession } = useSession();

  return useMutation({
    mutationFn: verifyEmailLogin,
    onSuccess: (session) => startSession(session),
  });
}
