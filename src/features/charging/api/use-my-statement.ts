import { useQuery } from '@tanstack/react-query';

import { getMyMonthlyStatement } from '@/features/charging/api/statement-api';
import { shouldRetryChargingRequest } from '@/features/charging/api/use-charge-points';

export const myStatementQueryKey = (month: string) => ['statements', 'mine', month] as const;

export function useMyStatement(month: string) {
  return useQuery({
    queryKey: myStatementQueryKey(month),
    queryFn: () => getMyMonthlyStatement(month),
    retry: shouldRetryChargingRequest,
  });
}
