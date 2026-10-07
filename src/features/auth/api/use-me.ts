import { useQuery } from '@tanstack/react-query';

import { getMe } from '@/features/auth/api/auth-api';
import { useSession } from '@/features/auth/session/session-context';

export const meQueryKey = ['auth', 'me'] as const;

export function useMe() {
  const { status, user } = useSession();

  return useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
    enabled: status === 'authenticated',
    placeholderData: user ?? undefined,
  });
}
