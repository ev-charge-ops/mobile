import { apiClient } from '@/lib/api-client';
import type { components } from '@/lib/api-schema';

export type ChargePoint = components['schemas']['ChargePointResponseDto'];
export type ChargePointPricing = components['schemas']['ChargePointPricingDto'];
export type ChargePointStatus = components['schemas']['ChargePointStatus'];
export type ChargePointType = components['schemas']['ChargePointType'];
export type DemandLevel = components['schemas']['DemandLevel'];
export type DemandFactorSource = components['schemas']['DemandFactorSource'];

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
