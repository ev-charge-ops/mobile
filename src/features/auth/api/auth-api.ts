import { apiClient, publicApiClient } from '@/lib/api-client';
import type { components } from '@/lib/api-schema';

export type AuthUser = components['schemas']['UserResponseDto'];
export type AuthSession = components['schemas']['AuthResponseDto'];
export type LoginInput = components['schemas']['LoginDto'];
export type RegisterInput = components['schemas']['RegisterDto'];

export class AuthApiError extends Error {
  constructor(readonly status: number | null) {
    super(status ? `Auth request failed with status ${status}` : 'Auth request failed without a response');
    this.name = 'AuthApiError';
  }
}

async function unwrap<T>(request: Promise<{ data?: T; response: Response }>): Promise<T> {
  let result: { data?: T; response: Response };
  try {
    result = await request;
  } catch {
    throw new AuthApiError(null);
  }
  if (!result.response.ok || result.data === undefined) throw new AuthApiError(result.response.status);
  return result.data;
}

export function login(body: LoginInput) {
  return unwrap(publicApiClient.POST('/auth/login', { body }));
}

export function register(body: RegisterInput) {
  return unwrap(publicApiClient.POST('/auth/register', { body }));
}

export function refresh(refreshToken: string) {
  return unwrap(publicApiClient.POST('/auth/refresh', { body: { refreshToken } }));
}

export async function logout(refreshToken: string) {
  let response: Response;
  try {
    ({ response } = await publicApiClient.POST('/auth/logout', { body: { refreshToken } }));
  } catch {
    throw new AuthApiError(null);
  }
  if (!response.ok) throw new AuthApiError(response.status);
}

export function getMe() {
  return unwrap(apiClient.GET('/auth/me'));
}
