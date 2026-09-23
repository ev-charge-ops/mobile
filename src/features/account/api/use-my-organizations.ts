import { useQuery } from '@tanstack/react-query';

import { listMyOrganizations } from '@/features/account/api/organizations-api';

export const myOrganizationsQueryKey = ['me', 'organizations'] as const;

export function useMyOrganizations() {
  return useQuery({
    queryKey: myOrganizationsQueryKey,
    queryFn: listMyOrganizations,
  });
}
