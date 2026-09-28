import { useMutation, useQueryClient } from '@tanstack/react-query';

import { changeMyPassword } from '@/features/auth/api/auth-api';
import { meQueryKey } from '@/features/auth/api/use-me';
import { useSession } from '@/features/auth/session/session-context';

export function useChangePassword() {
  const queryClient = useQueryClient();
  const { startSession } = useSession();

  return useMutation({
    mutationFn: changeMyPassword,
    onSuccess: async (session) => {
      await startSession(session);
      queryClient.setQueryData(meQueryKey, session.user);
    },
  });
}
