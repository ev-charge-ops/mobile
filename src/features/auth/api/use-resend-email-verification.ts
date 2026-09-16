import { useMutation } from '@tanstack/react-query';

import { resendEmailVerification } from '@/features/auth/api/auth-api';

export function useResendEmailVerification() {
  return useMutation({ mutationFn: resendEmailVerification });
}
