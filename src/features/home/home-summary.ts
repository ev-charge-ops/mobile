import type { Status } from '@/components/ui/status-pill';
import type { components } from '@/lib/api-schema';
import { formatCurrency } from '@/utils/format-currency';
import { formatEnergy } from '@/utils/format-energy';

type Session = components['schemas']['SessionResponseDto'];
type SessionStatus = components['schemas']['ChargingSessionStatus'];
type ChargePoint = components['schemas']['ChargePointResponseDto'];

export type HomeOrganization = { name: string; unitLabel: string | null };

export type HomeCharge = {
  sessionId: string;
  title: string;
  subtitle: string | null;
  isCharging: boolean;
  statusLabel: string;
  status: Status;
  pointLabel: string;
  percent: number | null;
  limitPercent: number | null;
  energy: string;
  power: string;
  amount: string;
};

export type HomePoint = {
  id: string;
  title: string;
  photoUrl: string | null;
  details: string[];
  statusLabel: string;
  status: Status;
};

type StatusCopy = { title: string; label: string; status: Status; hint?: string };

const statusCopy: Partial<Record<SessionStatus, StatusCopy>> = {
  AWAITING_PAYMENT: { title: 'Aguardando pagamento', label: 'Pagamento', status: 'info' },
  PENDING: { title: 'Liberando o carregador', label: 'Liberando', status: 'info' },
  ACTIVE: { title: 'Recarga em andamento', label: 'Carregando', status: 'charging' },
  GRACE: { title: 'Carga concluída', label: 'Tolerância', status: 'idle', hint: 'Retire o veículo' },
  IDLE: { title: 'Taxa de ocupação em curso', label: 'Ocupação', status: 'fault', hint: 'Retire o veículo' },
};

const powerFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const amountFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function getFirstName(name: string | undefined) {
  return name?.trim().split(/\s+/)[0] ?? '';
}

export function formatGreeting(name: string | undefined) {
  const first = getFirstName(name);
  return first ? `Olá, ${first}` : 'Olá';
}

export function formatHomeSubtitle(organizations: HomeOrganization[] | undefined) {
  if (!organizations || organizations.length === 0) return null;
  const withUnit = organizations.find((organization) => organization.unitLabel);
  if (withUnit?.unitLabel) return `${withUnit.name} · ${withUnit.unitLabel}`;
  return organizations[0].name;
}

export function formatPointTitle(code: string, name: string) {
  const place = name.split(' · ').pop()?.trim();
  return place && place !== code ? `${code} · ${place}` : code;
}

export function formatMinutes(totalMinutes: number) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${String(minutes % 60).padStart(2, '0')}min`;
}

export function formatSessionLimit(limit: Session['limit']) {
  if (limit.type === 'PERCENT' && limit.socPercent !== null) return `Limite ${limit.socPercent}%`;
  if (limit.type === 'ENERGY' && limit.energyKwh !== null) {
    return `Limite ${formatEnergy(limit.energyKwh, { fractionDigits: 1 })}`;
  }
  if (limit.type === 'AMOUNT' && limit.amountCents !== null) return `Limite ${formatCurrency(limit.amountCents / 100)}`;
  return 'Até completar';
}

export function formatChargingEta(session: Session, now: number) {
  if (session.status !== 'ACTIVE' || !session.projectedChargingEndsAt) return null;
  const minutes = Math.ceil((Date.parse(session.projectedChargingEndsAt) - now) / 60_000);
  if (!Number.isFinite(minutes)) return null;
  return minutes <= 0 ? 'terminando' : `cerca de ${formatMinutes(minutes)}`;
}

function getChargePercent(session: Session) {
  if (session.socPercent !== null) return Math.round(session.socPercent);
  if (session.targetEnergyKwh !== null && session.targetEnergyKwh > 0) {
    return Math.round(Math.min(1, session.energyKwh / session.targetEnergyKwh) * 100);
  }
  return null;
}

export function toHomeCharge(session: Session | null | undefined, now: number): HomeCharge | null {
  if (!session) return null;
  const copy = statusCopy[session.status];
  if (!copy) return null;

  const subtitle = [formatSessionLimit(session.limit), copy.hint ?? formatChargingEta(session, now)]
    .filter(Boolean)
    .join(' · ');

  return {
    sessionId: session.id,
    title: copy.title,
    subtitle: subtitle || null,
    isCharging: session.status === 'ACTIVE',
    statusLabel: copy.label,
    status: copy.status,
    pointLabel: formatPointTitle(session.chargePoint.code, session.chargePoint.name),
    percent: getChargePercent(session),
    limitPercent: session.limit.type === 'PERCENT' ? session.limit.socPercent : null,
    energy: formatEnergy(session.energyKwh, { withUnit: false }),
    power: powerFormatter.format(session.powerKw),
    amount: amountFormatter.format(session.totalCents / 100),
  };
}

function getPointStatus(point: ChargePoint): { label: string; status: Status } {
  if (point.status === 'OFFLINE') return { label: 'Offline', status: 'offline' };
  if (point.status !== 'AVAILABLE' || point.reservedUntil) return { label: 'Ocupado', status: 'offline' };
  if (point.pricing?.demandLevel === 'PEAK') return { label: 'Pico', status: 'idle' };
  return { label: 'Livre', status: 'available' };
}

export function toHomePoint(point: ChargePoint, distanceLabel: string | null): HomePoint {
  const place = distanceLabel ?? (point.type === 'COMMERCIAL' ? 'cartão' : null);
  const { label, status } = getPointStatus(point);

  return {
    id: point.id,
    title: formatPointTitle(point.code, point.name),
    photoUrl: point.photoUrl ?? null,
    details: [
      `${powerFormatter.format(point.maxPowerKw)} kW`,
      ...(point.pricing ? [`${formatCurrency(point.pricing.pricePerKwhCents / 100)}/kWh`] : []),
      ...(place ? [place] : []),
    ],
    statusLabel: label,
    status,
  };
}
