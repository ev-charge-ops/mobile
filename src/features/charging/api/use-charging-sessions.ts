import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  confirmSessionPayment,
  createSessionPaymentSheet,
  getActiveSession,
  getSession,
  listMySessions,
  startSession,
  stopSession,
  type ChargingSession,
  type ChargingSessionDetail,
  type PaymentSheetParams,
  type StartSessionInput,
} from '@/features/charging/api/charging-api';
import { chargePointsQueryKey, shouldRetryChargingRequest } from '@/features/charging/api/use-charge-points';
import { presentCardPayment } from '@/features/charging/payments/card-payment';
import { isSessionOpen } from '@/features/charging/session-timing';

export const activeSessionQueryKey = ['sessions', 'active'] as const;
export const chargingSessionQueryKey = (sessionId: string) => ['sessions', 'detail', sessionId] as const;
export const sessionsQueryKey = ['sessions'] as const;

export const SESSION_POLL_INTERVAL = 2_000;
const ACTIVE_SESSION_IDLE_INTERVAL = 30_000;

export function useActiveSession() {
  return useQuery({
    queryKey: activeSessionQueryKey,
    queryFn: getActiveSession,
    refetchInterval: (query) => (query.state.data ? SESSION_POLL_INTERVAL : ACTIVE_SESSION_IDLE_INTERVAL),
  });
}

export function hasOpenSession(session: ChargingSession | null | undefined) {
  return session != null && isSessionOpen(session.status);
}

export function useHasActiveSession() {
  const { data } = useActiveSession();
  return hasOpenSession(data);
}

export function useChargingSession(sessionId: string) {
  return useQuery({
    queryKey: chargingSessionQueryKey(sessionId),
    queryFn: () => getSession(sessionId),
    enabled: sessionId.length > 0,
    retry: shouldRetryChargingRequest,
    refetchInterval: (query) =>
      query.state.data && isSessionOpen(query.state.data.status) ? SESSION_POLL_INTERVAL : false,
  });
}

function mergeIntoDetail(session: ChargingSession, previous: ChargingSessionDetail | undefined): ChargingSessionDetail {
  return { ...session, readings: previous?.readings ?? [] };
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: StartSessionInput) => startSession(body),
    onSuccess: (session) => {
      queryClient.setQueryData(chargingSessionQueryKey(session.id), mergeIntoDetail(session, undefined));
      queryClient.setQueryData(activeSessionQueryKey, session);
      queryClient.invalidateQueries({ queryKey: chargePointsQueryKey });
    },
  });
}

export function useStopSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => stopSession(sessionId),
    onSuccess: (session) => {
      queryClient.setQueryData<ChargingSessionDetail>(chargingSessionQueryKey(sessionId), (previous) =>
        mergeIntoDetail(session, previous),
      );
      queryClient.setQueryData(activeSessionQueryKey, null);
      queryClient.invalidateQueries({ queryKey: chargePointsQueryKey });
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey, exact: false, refetchType: 'none' });
    },
  });
}

const HISTORY_PAGE_SIZE = 20;

export const sessionHistoryQueryKey = ['sessions', 'history'] as const;

export function useSessionHistory() {
  return useInfiniteQuery({
    queryKey: sessionHistoryQueryKey,
    queryFn: ({ pageParam }) => listMySessions(pageParam, HISTORY_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total ? lastPage.page + 1 : undefined,
  });
}

export type PayForSessionInput = { sessionId: string; sheet?: PaymentSheetParams | null };

export function usePayForSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, sheet }: PayForSessionInput) => {
      const params = sheet ?? (await createSessionPaymentSheet(sessionId));
      const result = await presentCardPayment(params);
      if (result === 'canceled') return null;
      return confirmSessionPayment(sessionId);
    },
    onSuccess: (session) => {
      if (!session) return;
      queryClient.setQueryData<ChargingSessionDetail>(chargingSessionQueryKey(session.id), (previous) =>
        mergeIntoDetail(session, previous),
      );
      queryClient.setQueryData(activeSessionQueryKey, isSessionOpen(session.status) ? session : null);
    },
  });
}
