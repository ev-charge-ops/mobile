import { ChargingApiError } from '@/features/charging/api/charging-api';
import { apiClient } from '@/lib/api-client';
import type { components } from '@/lib/api-schema';

export type MyMonthlyStatement = components['schemas']['MyMonthlyStatementResponseDto'];

export async function getMyMonthlyStatement(month: string): Promise<MyMonthlyStatement | null> {
  let result: Awaited<ReturnType<typeof requestStatement>>;
  try {
    result = await requestStatement(month);
  } catch {
    throw new ChargingApiError(null);
  }
  if (result.response.status === 404) return null;
  if (!result.response.ok || result.data === undefined) throw new ChargingApiError(result.response.status);
  return result.data;
}

function requestStatement(month: string) {
  return apiClient.GET('/me/statements/{month}', { params: { path: { month } } });
}
