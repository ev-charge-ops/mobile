import { ChargingApiError } from '@/features/charging/api/charging-api';
import { CardPaymentError } from '@/features/charging/payments/card-payment';

const NETWORK_ERROR = 'Não foi possível conectar ao servidor. Tente novamente.';
const UNEXPECTED_ERROR = 'Algo deu errado. Tente novamente.';

const startSessionMessages: Record<string, string> = {
  CHARGE_POINT_BUSY: 'Este ponto acabou de ser ocupado. Escolha outro ponto livre.',
  CHARGE_POINT_RESERVED: 'Este ponto está reservado para o próximo da fila.',
  ACTIVE_SESSION_EXISTS: 'Você já tem uma recarga em andamento.',
  CHARGE_POINT_OFFLINE: 'O carregador está offline no momento.',
  TARIFF_NOT_CONFIGURED: 'A tarifa deste ponto ainda não foi configurada pelo gestor.',
  BUILDING_CAPACITY_EXCEEDED: 'O prédio atingiu a potência contratada agora. Tente novamente em alguns minutos.',
  CHARGER_UNAVAILABLE: 'O carregador não respondeu ao comando de início. Tente novamente.',
  INVALID_LIMIT: 'O limite escolhido não é válido.',
  PAYMENTS_UNAVAILABLE: 'O pagamento com cartão está indisponível no momento.',
  PAYMENT_PROVIDER_ERROR: 'Não foi possível falar com o provedor de pagamento. Tente novamente.',
};

export function getStartSessionErrorMessage(error: unknown) {
  if (!(error instanceof ChargingApiError)) return UNEXPECTED_ERROR;
  if (error.status === null) return NETWORK_ERROR;
  if (error.code && startSessionMessages[error.code]) return startSessionMessages[error.code];
  if (error.status === 404) return 'Este ponto de recarga não está mais disponível.';
  return UNEXPECTED_ERROR;
}

export function getStopSessionErrorMessage(error: unknown) {
  if (!(error instanceof ChargingApiError)) return UNEXPECTED_ERROR;
  if (error.status === null) return NETWORK_ERROR;
  if (error.code === 'SESSION_ALREADY_ENDED') return 'Esta recarga já foi encerrada.';
  return 'Não foi possível encerrar a recarga. Tente novamente.';
}

export function isActiveSessionConflict(error: unknown) {
  return error instanceof ChargingApiError && error.code === 'ACTIVE_SESSION_EXISTS';
}

export function getCardPaymentErrorMessage(error: unknown) {
  if (error instanceof CardPaymentError) return error.message;
  if (!(error instanceof ChargingApiError)) return UNEXPECTED_ERROR;
  if (error.status === null) return NETWORK_ERROR;
  if (error.code === 'PAYMENT_PROVIDER_ERROR') return startSessionMessages.PAYMENT_PROVIDER_ERROR;
  if (error.code === 'PAYMENT_NOT_PENDING') return 'Este pagamento não está mais pendente.';
  return 'Não foi possível concluir o pagamento. Tente novamente.';
}
