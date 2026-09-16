import { useMutation } from '@tanstack/react-query';

import { login } from '@/features/auth/api/auth-api';
import { useSession } from '@/features/auth/session/session-context';

export function useLogin() {
  const { startSession } = useSession();

  return useMutation({
    mutationFn: login,
    onSuccess: (session) => startSession(session),
  });
}
