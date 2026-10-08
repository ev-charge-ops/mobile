import { ACCOUNT_DELETION_CONFIRMATION, PrivacyApiError } from '@/features/privacy/api/privacy-api';

export type AccountDeletionError = 'password' | 'manager' | 'confirmation' | 'rate' | 'generic';

export function getAccountDeletionError(error: unknown): AccountDeletionError {
  if (!(error instanceof PrivacyApiError)) return 'generic';
  if (error.code === 'INVALID_PASSWORD') return 'password';
  if (error.code === 'LAST_MANAGER' || error.status === 409) return 'manager';
  if (error.status === 429) return 'rate';
  if (error.status === 400) return 'confirmation';
  return 'generic';
}

export const accountDeletionErrorMessages: Record<AccountDeletionError, string> = {
  password: 'Senha incorreta. Confira e tente de novo.',
  manager:
    'Você é o único gestor de um condomínio. Passe a gestão para outra pessoa no painel web antes de excluir a conta.',
  confirmation: `Digite ${ACCOUNT_DELETION_CONFIRMATION} para confirmar a exclusão.`,
  rate: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
  generic: 'Não foi possível excluir a conta agora. Verifique sua conexão e tente de novo.',
};

export function isDeletionConfirmed(value: string) {
  return value.trim().toLocaleUpperCase('pt-BR') === ACCOUNT_DELETION_CONFIRMATION;
}

export function canDeleteAccount({
  confirmation,
  password,
  hasPassword,
}: {
  confirmation: string;
  password: string;
  hasPassword: boolean;
}) {
  return isDeletionConfirmed(confirmation) && (!hasPassword || password.length > 0);
}
