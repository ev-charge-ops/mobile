import { useMutation } from '@tanstack/react-query';

import { requestEmailLogin } from '@/features/auth/api/auth-api';

export function useRequestEmailLogin() {
  return useMutation({ mutationFn: requestEmailLogin });
}
