import { AuthApiError } from '@/features/auth/api/auth-api';

const NETWORK_ERROR = 'Não foi possível conectar ao servidor. Tente novamente.';
const UNEXPECTED_ERROR = 'Algo deu errado. Tente novamente.';

function statusOf(error: unknown) {
  return error instanceof AuthApiError ? error.status : undefined;
}

export function formatWaitTime(seconds: number) {
  if (seconds < 60) return `${Math.max(1, seconds)} s`;
  return `${Math.ceil(seconds / 60)} min`;
}

export function getRateLimitMessage(error: unknown) {
  if (!(error instanceof AuthApiError) || error.status !== 429) return null;
  if (error.retryAfterSeconds == null) return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
  return `Muitas tentativas. Tente novamente em ${formatWaitTime(error.retryAfterSeconds)}.`;
}

function getCommonErrorMessage(error: unknown) {
  const rateLimitMessage = getRateLimitMessage(error);
  if (rateLimitMessage) return rateLimitMessage;
  if (statusOf(error) === null) return NETWORK_ERROR;
  return UNEXPECTED_ERROR;
}

export function getLoginErrorMessage(error: unknown) {
  const status = statusOf(error);
  if (status === 400 || status === 401) return 'E-mail ou senha inválidos';
  return getCommonErrorMessage(error);
}

export function getRegisterErrorMessage(error: unknown) {
  const status = statusOf(error);
  if (status === 409) return 'Este e-mail já está cadastrado';
  if (status === 400) return 'Verifique os dados informados e tente novamente.';
  return getCommonErrorMessage(error);
}

export function getForgotPasswordErrorMessage(error: unknown) {
  if (statusOf(error) === 400) return 'Informe um e-mail válido';
  return getCommonErrorMessage(error);
}

export function getResetPasswordErrorMessage(error: unknown) {
  if (statusOf(error) === 400) return 'Link inválido ou expirado. Solicite uma nova redefinição de senha.';
  return getCommonErrorMessage(error);
}

export function getVerifyEmailErrorMessage(error: unknown) {
  if (statusOf(error) === 400) return 'Link de verificação inválido ou expirado. Solicite um novo e-mail.';
  return getCommonErrorMessage(error);
}

export function getResendVerificationErrorMessage(error: unknown) {
  if (statusOf(error) === 401) return 'Sua sessão expirou. Entre novamente.';
  return getCommonErrorMessage(error);
}

export function getEmailLoginRequestErrorMessage(error: unknown) {
  if (statusOf(error) === 400) return 'Informe um e-mail válido';
  return getCommonErrorMessage(error);
}

export function getEmailLoginCodeErrorMessage(error: unknown) {
  const status = statusOf(error);
  if (status === 400 || status === 401) return 'Código inválido ou expirado';
  return getCommonErrorMessage(error);
}

export function getEmailLoginLinkErrorMessage(error: unknown) {
  const status = statusOf(error);
  if (status === 400 || status === 401) return 'Este link de acesso é inválido ou expirou. Solicite um novo código.';
  return getCommonErrorMessage(error);
}

export type OAuthProvider = 'google' | 'apple';

const oauthProviderNames: Record<OAuthProvider, { name: string; withArticle: string }> = {
  google: { name: 'Google', withArticle: 'o Google' },
  apple: { name: 'Apple', withArticle: 'a Apple' },
};

export function getOAuthLoginErrorMessage(provider: OAuthProvider, error: unknown) {
  const { name, withArticle } = oauthProviderNames[provider];
  if (!(error instanceof AuthApiError)) return `Não foi possível entrar com ${withArticle}. Tente novamente.`;
  if (error.status === 400 || error.status === 401) {
    return `Não foi possível validar sua conta ${name}. Tente outro método de acesso.`;
  }
  return getCommonErrorMessage(error);
}

export type InviteUnavailableReason = 'NOT_FOUND' | 'EXPIRED' | 'REVOKED' | 'ACCEPTED';

const unavailableReasonsByCode: Record<string, InviteUnavailableReason> = {
  INVITE_NOT_FOUND: 'NOT_FOUND',
  INVITE_EXPIRED: 'EXPIRED',
  INVITE_REVOKED: 'REVOKED',
  INVITE_ALREADY_ACCEPTED: 'ACCEPTED',
};

export function getInviteUnavailableReason(error: unknown): InviteUnavailableReason | null {
  if (!(error instanceof AuthApiError)) return null;
  if (error.code && unavailableReasonsByCode[error.code]) return unavailableReasonsByCode[error.code];
  if (error.status === 404) return 'NOT_FOUND';
  if (error.status === 410) return 'EXPIRED';
  return null;
}

export function isInviteEmailMismatch(error: unknown) {
  return error instanceof AuthApiError && (error.code === 'INVITE_EMAIL_MISMATCH' || error.status === 403);
}

export function getAcceptInviteErrorMessage(error: unknown) {
  const status = statusOf(error);
  if (status === 409) return 'Este e-mail já tem uma conta. Toque em "Já tenho conta" para entrar e aceitar o convite.';
  if (status === 400) return 'Verifique os dados informados e tente novamente.';
  return getCommonErrorMessage(error);
}
