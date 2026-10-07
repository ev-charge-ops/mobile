import type { Status } from '@/components/ui/status-pill';
import type {
  ChargePointStatus,
  ChargePointType,
  DemandFactorSource,
  DemandLevel,
} from '@/features/charging/api/charging-api';
import type { components } from '@/lib/api-schema';
import { formatCurrency } from '@/utils/format-currency';

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
};
