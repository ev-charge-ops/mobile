import { apiClient } from '@/lib/api-client';
import type { components } from '@/lib/api-schema';

export type MyConsents = components['schemas']['MyConsentsResponseDto'];
export type ConsentPurposeState = components['schemas']['ConsentPurposeStateDto'];
export type ConsentPurpose = components['schemas']['ConsentPurpose'];
export type ConsentChoice = components['schemas']['ConsentChoiceDto'];
export type UpdateConsentsInput = components['schemas']['UpdateMyConsentsRequestDto'];
export type MyDataExport = components['schemas']['MyDataExportResponseDto'];
export type DeletionRequest = components['schemas']['DeletionRequestResponseDto'];
export type DeleteMyAccountInput = components['schemas']['DeleteMyAccountRequestDto'];

export class PrivacyApiError extends Error {
  constructor(
    readonly status: number | null,
    readonly code: string | null = null,
  ) {
    super(status ? `Privacy request failed with status ${status}` : 'Privacy request failed without a response');
    this.name = 'PrivacyApiError';
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
    throw new PrivacyApiError(null);
  }
  if (!result.response.ok || result.data === undefined) {
    throw new PrivacyApiError(result.response.status, getErrorCode(result.error));
  }
  return result.data;
}

export function getMyConsents() {
  return unwrap(apiClient.GET('/me/consents'));
}

export function updateMyConsents(body: UpdateConsentsInput) {
  return unwrap(apiClient.PUT('/me/consents', { body }));
}

export function exportMyData() {
  return unwrap(apiClient.GET('/me/data-export'));
}

export const ACCOUNT_DELETION_CONFIRMATION = 'EXCLUIR';

export function deleteMyAccount(password?: string) {
  return unwrap(
    apiClient.DELETE('/me', {
      body: password ? { password, confirm: ACCOUNT_DELETION_CONFIRMATION } : { confirm: ACCOUNT_DELETION_CONFIRMATION },
    }),
  );
}
