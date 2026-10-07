import { useQuery } from '@tanstack/react-query';

import { ChargingApiError, getChargePoint, listChargePoints } from '@/features/charging/api/charging-api';

export const chargePointsQueryKey = ['charge-points'] as const;
export const chargePointQueryKey = (chargePointId: string) => ['charge-points', chargePointId] as const;

const CHARGE_POINTS_REFRESH_INTERVAL = 30_000;

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
    refetchInterval: CHARGE_POINTS_REFRESH_INTERVAL,
  });
}
