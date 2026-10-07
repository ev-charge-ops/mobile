import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMyProfile } from '@/features/auth/api/auth-api';
import { meQueryKey } from '@/features/auth/api/use-me';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(meQueryKey, user);
    },
  });
}
