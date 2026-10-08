import {
  canDeleteAccount,
  getAccountDeletionError,
  isDeletionConfirmed,
} from '@/features/privacy/account-deletion';
import { PrivacyApiError } from '@/features/privacy/api/privacy-api';

describe('getAccountDeletionError', () => {
  it('maps the API errors', () => {
    expect(getAccountDeletionError(new PrivacyApiError(400, 'INVALID_PASSWORD'))).toBe('password');
    expect(getAccountDeletionError(new PrivacyApiError(409, 'LAST_MANAGER'))).toBe('manager');
    expect(getAccountDeletionError(new PrivacyApiError(409))).toBe('manager');
    expect(getAccountDeletionError(new PrivacyApiError(400))).toBe('confirmation');
    expect(getAccountDeletionError(new PrivacyApiError(429))).toBe('rate');
    expect(getAccountDeletionError(new PrivacyApiError(null))).toBe('generic');
    expect(getAccountDeletionError(new Error('boom'))).toBe('generic');
  });
});

describe('canDeleteAccount', () => {
  it('needs the typed confirmation, in any case', () => {
    expect(isDeletionConfirmed(' excluir ')).toBe(true);
    expect(isDeletionConfirmed('EXCLUI')).toBe(false);
  });

  it('needs the password only for accounts that have one', () => {
    expect(canDeleteAccount({ confirmation: 'EXCLUIR', password: '', hasPassword: false })).toBe(true);
    expect(canDeleteAccount({ confirmation: 'EXCLUIR', password: '', hasPassword: true })).toBe(false);
    expect(canDeleteAccount({ confirmation: 'EXCLUIR', password: 'secret', hasPassword: true })).toBe(true);
    expect(canDeleteAccount({ confirmation: 'sim', password: 'secret', hasPassword: true })).toBe(false);
  });
});
