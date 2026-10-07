import { useMutation } from '@tanstack/react-query';

import { useSession } from '@/features/auth/session/session-context';

export function useLogout() {
  const { endSession } = useSession();

  return useMutation({ mutationFn: endSession });
}
