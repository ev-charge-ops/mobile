import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteMyAccount,
  exportMyData,
  getMyConsents,
  updateMyConsents,
  type UpdateConsentsInput,
} from '@/features/privacy/api/privacy-api';

export const myConsentsQueryKey = ['me', 'consents'] as const;

export function useMyConsents() {
  return useQuery({
    queryKey: myConsentsQueryKey,
    queryFn: getMyConsents,
  });
}

export function useUpdateConsents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateConsentsInput) => updateMyConsents(body),
    onSuccess: (consents) => {
      queryClient.setQueryData(myConsentsQueryKey, consents);
    },
  });
}

export function useExportMyData() {
  return useMutation({ mutationFn: exportMyData });
}

export function useDeleteMyAccount() {
  return useMutation({ mutationFn: (password?: string) => deleteMyAccount(password) });
}
