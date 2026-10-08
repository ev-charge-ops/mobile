import { apiClient } from '@/lib/api-client';
import type { components } from '@/lib/api-schema';

export type ChargePoint = components['schemas']['ChargePointResponseDto'];
export type ChargePointMapItem = components['schemas']['ChargePointMapItemResponseDto'];
export type ChargePointCluster = components['schemas']['ChargePointClusterResponseDto'];
export type ConnectorType = components['schemas']['ConnectorType'];
export type ChargePointPricing = components['schemas']['ChargePointPricingDto'];
export type ChargePointStatus = components['schemas']['ChargePointStatus'];
export type ChargePointType = components['schemas']['ChargePointType'];
export type DemandLevel = components['schemas']['DemandLevel'];
export type DemandFactorSource = components['schemas']['DemandFactorSource'];
export type ChargingSession = components['schemas']['SessionResponseDto'];
export type ChargingSessionDetail = components['schemas']['SessionDetailResponseDto'];
export type ChargingSessionStatus = components['schemas']['ChargingSessionStatus'];
export type StartSessionInput = components['schemas']['StartSessionRequestDto'];
export type ChargingLimitInput = components['schemas']['ChargingLimitRequestDto'];
export type StartedSession = components['schemas']['StartSessionResponseDto'];
export type PaymentSheetParams = components['schemas']['PaymentSheetDto'];
export type SessionPayment = components['schemas']['SessionPaymentDto'];
export type QueueEntry = components['schemas']['QueueEntryResponseDto'];

export class ChargingApiError extends Error {
  constructor(
    readonly status: number | null,
    readonly code: string | null = null,
  ) {
    super(status ? `Charging request failed with status ${status}` : 'Charging request failed without a response');
    this.name = 'ChargingApiError';
  }
}

function getErrorCode(body: unknown) {
  if (typeof body !== 'object' || body === null || !('code' in body)) return null;
  return typeof body.code === 'string' ? body.code : null;
}

type ApiResult<T> = { data?: T; error?: unknown; response: Response };

async function unwrap<T>(request: Promise<ApiResult<T>>): Promise<T> {
  let result: ApiResult<T>;
  try {
    result = await request;
  } catch {
    throw new ChargingApiError(null);
  }
  if (!result.response.ok || result.data === undefined) {
    throw new ChargingApiError(result.response.status, getErrorCode(result.error));
  }
  return result.data;
}

type ChargePointListItem = ChargePoint | ChargePointMapItem;

export function isChargePointMapItem(item: ChargePointListItem): item is ChargePointMapItem {
  return 'source' in item;
}

export async function listChargePoints(): Promise<ChargePoint[]> {
  const items: ChargePointListItem[] = await unwrap(apiClient.GET('/charge-points'));
  return items.filter((item): item is ChargePoint => !isChargePointMapItem(item));
}

export async function listChargePointsInBounds(bbox: string, limit?: number): Promise<ChargePointMapItem[]> {
  const items: ChargePointListItem[] = await unwrap(apiClient.GET('/charge-points', { params: { query: { bbox, limit } } }));
  return items.filter(isChargePointMapItem);
}

export function getChargePoint(chargePointId: string) {
  return unwrap(apiClient.GET('/charge-points/{chargePointId}', { params: { path: { chargePointId } } }));
}

export function startSession(body: StartSessionInput) {
  return unwrap(apiClient.POST('/sessions', { body }));
}

export async function getActiveSession() {
  const { session } = await unwrap(apiClient.GET('/sessions/active'));
  return session;
}

export function getSession(sessionId: string) {
  return unwrap(apiClient.GET('/sessions/{sessionId}', { params: { path: { sessionId } } }));
}

export function stopSession(sessionId: string) {
  return unwrap(apiClient.POST('/sessions/{sessionId}/stop', { params: { path: { sessionId } } }));
}

export function listMySessions(page: number, pageSize: number, month?: string) {
  return unwrap(apiClient.GET('/sessions', { params: { query: { page, pageSize, month } } }));
}

export function createSessionPaymentSheet(sessionId: string) {
  return unwrap(apiClient.POST('/sessions/{sessionId}/payment/sheet', { params: { path: { sessionId } } }));
}

export function confirmSessionPayment(sessionId: string) {
  return unwrap(apiClient.POST('/sessions/{sessionId}/payment/confirm', { params: { path: { sessionId } } }));
}

export function joinQueue(chargePointId: string) {
  return unwrap(apiClient.POST('/charge-points/{chargePointId}/queue', { params: { path: { chargePointId } } }));
}

export async function leaveQueue(chargePointId: string) {
  let result: ApiResult<unknown>;
  try {
    result = await apiClient.DELETE('/charge-points/{chargePointId}/queue', { params: { path: { chargePointId } } });
  } catch {
    throw new ChargingApiError(null);
  }
  if (!result.response.ok) throw new ChargingApiError(result.response.status, getErrorCode(result.error));
}
