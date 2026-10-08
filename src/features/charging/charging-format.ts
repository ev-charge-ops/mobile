import type { Status } from '@/components/ui/status-pill';
import type {
  ChargePointStatus,
  ChargePointType,
  ChargingSession,
  DemandFactorSource,
  DemandLevel,
  SessionPayment,
} from '@/features/charging/api/charging-api';
import type { components } from '@/lib/api-schema';
import { formatCurrency } from '@/utils/format-currency';
import { formatEnergy } from '@/utils/format-energy';

type ConnectorType = components['schemas']['ConnectorType'];

export function formatCents(cents: number) {
  return formatCurrency(cents / 100);
}

export function formatPricePerKwh(cents: number) {
  return `${formatCents(cents)}/kWh`;
}

const decimalFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

const amountFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatAmount(cents: number) {
  return amountFormatter.format(cents / 100);
}

export function formatPowerValue(kw: number) {
  return decimalFormatter.format(kw);
}

export function formatPower(kw: number) {
  return `${formatPowerValue(kw)} kW`;
}

export function formatDemandFactor(factor: number) {
  return `×${amountFormatter.format(factor)}`;
}

export const demandLevelLabels: Record<DemandLevel, string> = {
  OFF_PEAK: 'Fora de pico',
  NORMAL: 'Demanda normal',
  PEAK: 'Pico',
};

export const demandLevelStatus: Record<DemandLevel, Status> = {
  OFF_PEAK: 'available',
  NORMAL: 'info',
  PEAK: 'idle',
};

export function formatDemandSource(source: DemandFactorSource, modelVersion: string | null) {
  if (source === 'MODEL') return modelVersion ? `Previsão da IA · modelo ${modelVersion}` : 'Previsão da IA';
  return 'Regra por horário';
}

export const chargePointStatusLabels: Record<ChargePointStatus, string> = {
  AVAILABLE: 'Livre',
  CHARGING: 'Em uso',
  IDLE: 'Ocupado',
  OFFLINE: 'Offline',
};

export const chargePointStatusShortLabels: Record<ChargePointStatus, string> = {
  AVAILABLE: 'livre',
  CHARGING: 'em uso',
  IDLE: 'ocupado',
  OFFLINE: 'offline',
};

export function splitChargePointName(name: string) {
  const parts = name.split(' · ');
  if (parts.length < 2) return { garage: null, spot: name };
  return { garage: parts.slice(0, -1).join(' · '), spot: parts[parts.length - 1] };
}

export const chargePointStatusPill: Record<ChargePointStatus, Status> = {
  AVAILABLE: 'available',
  CHARGING: 'charging',
  IDLE: 'idle',
  OFFLINE: 'offline',
};

export const regimeLabels: Record<ChargePointType, string> = {
  PRIVATE: 'Condomínio',
  COMMERCIAL: 'Comercial',
};

export const connectorLabels: Record<ConnectorType, string> = {
  TYPE_2: 'Tipo 2',
  CCS_2: 'CCS 2',
  CHADEMO: 'CHAdeMO',
  OTHER: 'Outro',
};

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function formatTime(iso: string) {
  return timeFormatter.format(new Date(iso));
}

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function formatSessionCode(sessionId: string) {
  return `#${sessionId.slice(0, 8).toUpperCase()}`;
}

export function formatLimit(limit: ChargingSession['limit']) {
  if (limit.type === 'ENERGY' && limit.energyKwh !== null) return formatEnergy(limit.energyKwh, { fractionDigits: 1 });
  if (limit.type === 'AMOUNT' && limit.amountCents !== null) return `Até ${formatCents(limit.amountCents)}`;
  if (limit.type === 'PERCENT' && limit.socPercent !== null) return `Até ${limit.socPercent}%`;
  return 'Até completar';
}

export const sessionStatusLabels: Record<ChargingSession['status'], string> = {
  AWAITING_PAYMENT: 'Pagamento pendente',
  PENDING: 'Iniciando',
  ACTIVE: 'Carregando',
  GRACE: 'Tolerância',
  IDLE: 'Ocupação',
  CLOSED: 'Concluída',
  INTERRUPTED: 'Interrompida',
};

export const sessionStatusPill: Record<ChargingSession['status'], Status> = {
  AWAITING_PAYMENT: 'info',
  PENDING: 'info',
  ACTIVE: 'charging',
  GRACE: 'idle',
  IDLE: 'fault',
  CLOSED: 'available',
  INTERRUPTED: 'offline',
};

export const paymentStatusLabels: Record<SessionPayment['status'], string> = {
  PENDING_AUTHORIZATION: 'Aguardando autorização',
  AUTHORIZED: 'Pré-autorizado',
  CAPTURED: 'Cobrado',
  CANCELED: 'Liberado',
  FAILED: 'Recusado',
  REFUNDED: 'Estornado',
};
