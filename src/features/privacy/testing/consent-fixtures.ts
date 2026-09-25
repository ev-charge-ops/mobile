import type { ConsentPurposeState, MyConsents } from '@/features/privacy/api/privacy-api';

export function buildPurposes(): ConsentPurposeState[] {
  return [
    {
      purpose: 'ESSENTIAL_SERVICE',
      required: true,
      title: 'Serviço de recarga',
      description: 'Identidade, unidade e sessões para liberar o carregador.',
      granted: false,
      termsVersion: null,
      recordedAt: null,
    },
    {
      purpose: 'BILLING_SHARING',
      required: true,
      title: 'Rateio com o condomínio',
      description: 'Energia, horário e valor de cada recarga para a taxa condominial.',
      granted: false,
      termsVersion: null,
      recordedAt: null,
    },
    {
      purpose: 'USAGE_ANALYTICS',
      required: false,
      title: 'Análise de uso',
      description: 'Métricas anônimas para melhorar o app.',
      granted: true,
      termsVersion: '2026-09-01',
      recordedAt: '2026-09-01T12:00:00.000Z',
    },
    {
      purpose: 'MARKETING_COMMUNICATIONS',
      required: false,
      title: 'Novidades do produto',
      description: 'Comunicados sobre novas funções.',
      granted: false,
      termsVersion: null,
      recordedAt: null,
    },
  ];
}

export function buildConsents(overrides: Partial<MyConsents> = {}): MyConsents {
  return {
    termsVersion: '2026-10-07',
    acceptedTermsVersion: null,
    mustAccept: true,
    purposes: buildPurposes(),
    ...overrides,
  };
}
