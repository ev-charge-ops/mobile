import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  ChargingApiError,
  getChargePoint,
  joinQueue,
  leaveQueue,
  listChargePoints,
  type ChargePoint,
} from '@/features/charging/api/charging-api';

export const chargePointsQueryKey = ['charge-points'] as const;
export const chargePointQueryKey = (chargePointId: string) => ['charge-points', chargePointId] as const;

const CHARGE_POINTS_REFRESH_INTERVAL = 30_000;
const QUEUED_CHARGE_POINT_REFRESH_INTERVAL = 10_000;

export function shouldRetryChargingRequest(failureCount: number, error: unknown) {
  if (error instanceof ChargingApiError && error.status !== null && error.status < 500) return false;
  return failureCount < 1;
}

export function useChargePoints() {
  return useQuery({
    queryKey: chargePointsQueryKey,
    queryFn: listChargePoints,
    refetchInterval: CHARGE_POINTS_REFRESH_INTERVAL,
  });
}

export function useChargePoint(chargePointId: string) {
  return useQuery({
    queryKey: chargePointQueryKey(chargePointId),
    queryFn: () => getChargePoint(chargePointId),
    enabled: chargePointId.length > 0,
    retry: shouldRetryChargingRequest,
    refetchInterval: (query) =>
      query.state.data?.myQueueEntry ? QUEUED_CHARGE_POINT_REFRESH_INTERVAL : CHARGE_POINTS_REFRESH_INTERVAL,
  });
}

export function useJoinQueue(chargePointId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => joinQueue(chargePointId),
    onSuccess: (entry) => {
      queryClient.setQueryData<ChargePoint>(chargePointQueryKey(chargePointId), (previous) =>
        previous ? { ...previous, myQueueEntry: entry, queueLength: entry.queueLength } : previous,
      );
      queryClient.invalidateQueries({ queryKey: chargePointsQueryKey });
    },
  });
}

export function useLeaveQueue(chargePointId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveQueue(chargePointId),
    onSuccess: () => {
      queryClient.setQueryData<ChargePoint>(chargePointQueryKey(chargePointId), (previous) =>
        previous ? { ...previous, myQueueEntry: null, queueLength: Math.max(0, previous.queueLength - 1) } : previous,
      );
      queryClient.invalidateQueries({ queryKey: chargePointsQueryKey });
    },
  });
}
