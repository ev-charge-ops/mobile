import { apiClient } from '@/lib/api-client';
import type { components } from '@/lib/api-schema';

export type ChargePoint = components['schemas']['ChargePointResponseDto'];
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

export function listChargePoints() {
  return unwrap(apiClient.GET('/charge-points'));
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

export function listMySessions(page: number, pageSize: number) {
  return unwrap(apiClient.GET('/sessions', { params: { query: { page, pageSize } } }));
}

export function createSessionPaymentSheet(sessionId: string) {
  return unwrap(apiClient.POST('/sessions/{sessionId}/payment/sheet', { params: { path: { sessionId } } }));
}

export function confirmSessionPayment(sessionId: string) {
  return unwrap(apiClient.POST('/sessions/{sessionId}/payment/confirm', { params: { path: { sessionId } } }));
}
