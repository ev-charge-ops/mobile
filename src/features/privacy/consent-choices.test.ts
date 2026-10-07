import { PrivacyApiError } from '@/features/privacy/api/privacy-api';
import {
  buildConsentsPayload,
  formatTermsVersion,
  getConsentErrorMessage,
  isOutdatedTermsError,
} from '@/features/privacy/consent-choices';
import { buildPurposes } from '@/features/privacy/testing/consent-fixtures';

describe('buildConsentsPayload', () => {
  it('always grants the required purposes and keeps the latest optional choices', () => {
    expect(buildConsentsPayload('2026-10-07', buildPurposes(), {})).toEqual({
      termsVersion: '2026-10-07',
      consents: [
        { purpose: 'ESSENTIAL_SERVICE', granted: true },
        { purpose: 'BILLING_SHARING', granted: true },
        { purpose: 'USAGE_ANALYTICS', granted: true },
        { purpose: 'MARKETING_COMMUNICATIONS', granted: false },
      ],
    });
  });

  it('applies the toggled choices without revoking required purposes', () => {
    const payload = buildConsentsPayload('2026-10-07', buildPurposes(), {
      ESSENTIAL_SERVICE: false,
      USAGE_ANALYTICS: false,
      MARKETING_COMMUNICATIONS: true,
    });

    expect(payload.consents).toEqual([
      { purpose: 'ESSENTIAL_SERVICE', granted: true },
      { purpose: 'BILLING_SHARING', granted: true },
      { purpose: 'USAGE_ANALYTICS', granted: false },
      { purpose: 'MARKETING_COMMUNICATIONS', granted: true },
    ]);
  });
});

describe('consent errors', () => {
  it('maps the API codes to pt-BR messages', () => {
    expect(getConsentErrorMessage(new PrivacyApiError(409, 'TERMS_VERSION_OUTDATED'))).toBe(
      'Os termos foram atualizados. Revise e aceite a nova versão.',
    );
    expect(getConsentErrorMessage(new PrivacyApiError(400, 'REQUIRED_CONSENT'))).toBe(
      'As finalidades obrigatórias precisam ficar ativas.',
    );
    expect(getConsentErrorMessage(new PrivacyApiError(null))).toBe(
      'Não foi possível salvar suas escolhas. Tente novamente.',
    );
    expect(isOutdatedTermsError(new PrivacyApiError(409, 'TERMS_VERSION_OUTDATED'))).toBe(true);
    expect(isOutdatedTermsError(new Error('x'))).toBe(false);
  });
});

describe('formatTermsVersion', () => {
  it('formats date versions and keeps other labels', () => {
    expect(formatTermsVersion('2026-10-07')).toBe('Versão de 07/10/2026');
    expect(formatTermsVersion('2.1')).toBe('Versão 2.1');
  });
});
