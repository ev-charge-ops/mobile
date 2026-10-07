import { AuthApiError, parseRetryAfter } from '@/features/auth/api/auth-api';
import {
  formatWaitTime,
  getLoginErrorMessage,
  getRateLimitMessage,
  getResetPasswordErrorMessage,
  getVerifyEmailErrorMessage,
} from '@/features/auth/auth-errors';

describe('parseRetryAfter', () => {
  it('parses delta seconds', () => {
    expect(parseRetryAfter('42')).toBe(42);
    expect(parseRetryAfter('1.2')).toBe(2);
  });

  it('parses an http date', () => {
    const now = Date.parse('2026-10-07T10:00:00Z');
    expect(parseRetryAfter('Wed, 07 Oct 2026 10:01:30 GMT', now)).toBe(90);
  });

  it('ignores missing or invalid values', () => {
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter('')).toBeNull();
    expect(parseRetryAfter('soon')).toBeNull();
  });
});

describe('auth error messages', () => {
  it('formats the wait time', () => {
    expect(formatWaitTime(0)).toBe('1 s');
    expect(formatWaitTime(30)).toBe('30 s');
    expect(formatWaitTime(61)).toBe('2 min');
  });

  it('describes rate limiting with and without retry-after', () => {
    expect(getRateLimitMessage(new AuthApiError(429, 30))).toBe('Muitas tentativas. Tente novamente em 30 s.');
    expect(getRateLimitMessage(new AuthApiError(429))).toBe('Muitas tentativas. Aguarde um pouco e tente novamente.');
    expect(getRateLimitMessage(new AuthApiError(400))).toBeNull();
    expect(getLoginErrorMessage(new AuthApiError(429, 120))).toBe('Muitas tentativas. Tente novamente em 2 min.');
  });

  it('maps invalid tokens', () => {
    expect(getResetPasswordErrorMessage(new AuthApiError(400))).toMatch(/Link inválido ou expirado/);
    expect(getVerifyEmailErrorMessage(new AuthApiError(400))).toMatch(/inválido ou expirado/);
    expect(getVerifyEmailErrorMessage(new AuthApiError(null))).toBe(
      'Não foi possível conectar ao servidor. Tente novamente.',
    );
  });
});
