import { AuthApiError } from '@/features/auth/api/auth-api';

const NETWORK_ERROR = 'Não foi possível conectar ao servidor. Tente novamente.';
const UNEXPECTED_ERROR = 'Algo deu errado. Tente novamente.';

function statusOf(error: unknown) {
  return error instanceof AuthApiError ? error.status : undefined;
}

export function getLoginErrorMessage(error: unknown) {
  const status = statusOf(error);
  if (status === 400 || status === 401) return 'E-mail ou senha inválidos';
  if (status === null) return NETWORK_ERROR;
  return UNEXPECTED_ERROR;
}

export function getRegisterErrorMessage(error: unknown) {
  const status = statusOf(error);
  if (status === 409) return 'Este e-mail já está cadastrado';
  if (status === 400) return 'Verifique os dados informados e tente novamente.';
  if (status === null) return NETWORK_ERROR;
  return UNEXPECTED_ERROR;
}
