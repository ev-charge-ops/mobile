import { useMutation } from '@tanstack/react-query';

import { resetPassword } from '@/features/auth/api/auth-api';

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}
