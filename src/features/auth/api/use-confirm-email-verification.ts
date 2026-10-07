import { useMutation, useQueryClient } from '@tanstack/react-query';

import { confirmEmailVerification } from '@/features/auth/api/auth-api';
import { meQueryKey } from '@/features/auth/api/use-me';

export function useConfirmEmailVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmEmailVerification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meQueryKey }),
  });
}
