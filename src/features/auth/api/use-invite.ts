import { useMutation, useQuery } from '@tanstack/react-query';

import {
  acceptInvite,
  acceptInviteAsCurrentUser,
  AuthApiError,
  getInvitePreview,
  type AcceptInviteInput,
} from '@/features/auth/api/auth-api';
import { useSession } from '@/features/auth/session/session-context';

export const invitePreviewQueryKey = (token: string) => ['invites', token] as const;

function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof AuthApiError && error.status !== null && error.status < 500) return false;
  return failureCount < 1;
}

export function useInvitePreview(token: string) {
  return useQuery({
    queryKey: invitePreviewQueryKey(token),
    queryFn: () => getInvitePreview(token),
    enabled: token.length > 0,
    retry: shouldRetry,
  });
}

export function useAcceptInvite(token: string) {
  const { startSession } = useSession();

  return useMutation({
    mutationFn: (body: AcceptInviteInput) => acceptInvite(token, body),
    onSuccess: (session) => startSession(session),
  });
}

export function useAcceptInviteAsCurrentUser(token: string) {
  return useMutation({
    mutationFn: async () => {
      try {
        await acceptInviteAsCurrentUser(token);
      } catch (error) {
        if (error instanceof AuthApiError && error.code === 'ALREADY_MEMBER') return;
        throw error;
      }
    },
  });
}
