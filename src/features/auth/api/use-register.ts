import { useMutation } from '@tanstack/react-query';

import { register } from '@/features/auth/api/auth-api';
import { useSession } from '@/features/auth/session/session-context';

export function useRegister() {
  const { startSession } = useSession();

  return useMutation({
    mutationFn: register,
    onSuccess: (session) => startSession(session),
  });
}
