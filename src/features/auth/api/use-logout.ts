import { useMutation } from '@tanstack/react-query';

import { signOutFromGoogle } from '@/features/auth/oauth/google-sign-in';
import { useSession } from '@/features/auth/session/session-context';

export function useLogout() {
  const { endSession } = useSession();

  return useMutation({
    mutationFn: async () => {
      await endSession();
      await signOutFromGoogle();
    },
  });
}
