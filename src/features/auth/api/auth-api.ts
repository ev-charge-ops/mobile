import { apiClient, publicApiClient } from '@/lib/api-client';
import type { components } from '@/lib/api-schema';

export type AuthUser = components['schemas']['UserResponseDto'];
export type AuthSession = components['schemas']['AuthResponseDto'];
export type LoginInput = components['schemas']['LoginDto'];
export type RegisterInput = components['schemas']['RegisterDto'];
export type ResetPasswordInput = components['schemas']['ResetPasswordDto'];
export type AppleLoginInput = components['schemas']['AppleLoginDto'];
export type VerifyEmailLoginInput = { email: string; code: string } | { token: string };
export type InvitePreview = components['schemas']['InvitePreviewDto'];
export type AcceptInviteInput = components['schemas']['AcceptInviteDto'];

export class AuthApiError extends Error {
  constructor(
    readonly status: number | null,
    readonly retryAfterSeconds: number | null = null,
    readonly code: string | null = null,
  ) {
    super(status ? `Auth request failed with status ${status}` : 'Auth request failed without a response');
    this.name = 'AuthApiError';
  }
}

export function parseRetryAfter(value: string | null, now = Date.now()) {
  if (!value) return null;
  const seconds = Number(value);
  if (value.trim() !== '' && Number.isFinite(seconds)) return Math.max(0, Math.ceil(seconds));
  const date = Date.parse(value);
  if (Number.isNaN(date)) return null;
  return Math.max(0, Math.ceil((date - now) / 1000));
}

function getErrorCode(body: unknown) {
  if (typeof body !== 'object' || body === null || !('code' in body)) return null;
  return typeof body.code === 'string' ? body.code : null;
}

function toApiError(response: Response, body: unknown) {
  const retryAfter = response.status === 429 ? parseRetryAfter(response.headers.get('Retry-After')) : null;
  return new AuthApiError(response.status, retryAfter, getErrorCode(body));
}

type ApiResult<T> = { data?: T; error?: unknown; response: Response };

async function unwrap<T>(request: Promise<ApiResult<T>>): Promise<T> {
  let result: ApiResult<T>;
  try {
    result = await request;
  } catch {
    throw new AuthApiError(null);
  }
  if (!result.response.ok || result.data === undefined) throw toApiError(result.response, result.error);
  return result.data;
}

async function send(request: Promise<ApiResult<unknown>>): Promise<void> {
  let result: ApiResult<unknown>;
  try {
    result = await request;
  } catch {
    throw new AuthApiError(null);
  }
  if (!result.response.ok) throw toApiError(result.response, result.error);
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

export function logout(refreshToken: string) {
  return send(publicApiClient.POST('/auth/logout', { body: { refreshToken } }));
}

export function getMe() {
  return unwrap(apiClient.GET('/auth/me'));
}

export function forgotPassword(email: string) {
  return send(publicApiClient.POST('/auth/password/forgot', { body: { email } }));
}

export function resetPassword(body: ResetPasswordInput) {
  return send(publicApiClient.POST('/auth/password/reset', { body }));
}

export function confirmEmailVerification(token: string) {
  return send(publicApiClient.POST('/auth/email-verification/confirm', { body: { token } }));
}

export function resendEmailVerification() {
  return send(apiClient.POST('/auth/email-verification/resend'));
}

export function requestEmailLogin(email: string) {
  return send(publicApiClient.POST('/auth/email-login/request', { body: { email } }));
}

export function verifyEmailLogin(body: VerifyEmailLoginInput) {
  return unwrap(publicApiClient.POST('/auth/email-login/verify', { body }));
}

export function loginWithGoogle(idToken: string) {
  return unwrap(publicApiClient.POST('/auth/oauth/google', { body: { idToken } }));
}

export function loginWithApple(body: AppleLoginInput) {
  return unwrap(publicApiClient.POST('/auth/oauth/apple', { body }));
}

export function getInvitePreview(token: string) {
  return unwrap(publicApiClient.GET('/invites/{token}', { params: { path: { token } } }));
}

export function acceptInvite(token: string, body: AcceptInviteInput) {
  return unwrap(publicApiClient.POST('/invites/{token}/accept', { params: { path: { token } }, body }));
}

export function acceptInviteAsCurrentUser(token: string) {
  return send(apiClient.POST('/invites/{token}/accept-authenticated', { params: { path: { token } } }));
}
