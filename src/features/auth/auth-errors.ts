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
