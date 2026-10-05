import { Share } from 'react-native';

import {
  PrivacyApiError,
  type ConsentPurpose,
  type ConsentPurposeState,
  type MyDataExport,
  type UpdateConsentsInput,
} from '@/features/privacy/api/privacy-api';

export type ConsentChoices = Partial<Record<ConsentPurpose, boolean>>;

export function isPurposeGranted(purpose: ConsentPurposeState, choices: ConsentChoices) {
  if (purpose.required) return true;
  return choices[purpose.purpose] ?? purpose.granted;
}

export function buildConsentsPayload(
  termsVersion: string,
  purposes: ConsentPurposeState[],
  choices: ConsentChoices,
): UpdateConsentsInput {
  return {
    termsVersion,
    consents: purposes.map((purpose) => ({ purpose: purpose.purpose, granted: isPurposeGranted(purpose, choices) })),
  };
}

export function getConsentErrorMessage(error: unknown) {
  if (error instanceof PrivacyApiError) {
    if (error.code === 'TERMS_VERSION_OUTDATED') return 'Os termos foram atualizados. Revise e aceite a nova versão.';
    if (error.code === 'REQUIRED_CONSENT') return 'As finalidades obrigatórias precisam ficar ativas.';
  }
  return 'Não foi possível salvar suas escolhas. Tente novamente.';
}

export function isOutdatedTermsError(error: unknown) {
  return error instanceof PrivacyApiError && error.code === 'TERMS_VERSION_OUTDATED';
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function formatTermsVersion(termsVersion: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(termsVersion);
  if (!match) return `Versão ${termsVersion}`;
  const [, year, month, day] = match;
  return `Versão de ${dateFormatter.format(new Date(Number(year), Number(month) - 1, Number(day)))}`;
}

export async function shareDataExport(data: MyDataExport) {
  await Share.share({ title: 'Meus dados · EV ChargeOps', message: JSON.stringify(data, null, 2) });
}
