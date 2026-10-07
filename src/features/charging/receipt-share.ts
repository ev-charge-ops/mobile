import type { ChargingSession } from '@/features/charging/api/charging-api';
import {
  formatCents,
  formatDate,
  formatPricePerKwh,
  formatSessionCode,
  formatTime,
} from '@/features/charging/charging-format';
import { formatEnergy } from '@/utils/format-energy';

export function buildReceiptShareText(session: ChargingSession) {
  const endedAt = session.endedAt ?? session.chargingEndedAt;
  const period = endedAt
    ? `${formatTime(session.startedAt)} às ${formatTime(endedAt)}`
    : `a partir de ${formatTime(session.startedAt)}`;

  const lines = [
    `Recibo EV ChargeOps ${formatSessionCode(session.id)}`,
    session.status === 'INTERRUPTED' ? 'Recarga interrompida' : null,
    `${session.chargePoint.name} (${session.chargePoint.code})`,
    `${formatDate(session.startedAt)}, ${period}`,
    '',
    `Energia: ${formatEnergy(session.energyKwh)} · ${formatCents(session.energyCostCents)}`,
    `Tarifa travada: ${formatPricePerKwh(session.lockedRateCents)}`,
    session.idleFeeCents > 0
      ? `Taxa de ocupação: ${formatCents(session.idleFeeCents)} (${session.idleMinutes} min)`
      : 'Taxa de ocupação: sem cobrança',
    `Total: ${formatCents(session.totalCents)}`,
  ];

  if (session.payment?.capturedCents != null) {
    lines.push(`Cobrado no cartão: ${formatCents(session.payment.capturedCents)}`);
  } else if (session.regime === 'PRIVATE') {
    lines.push(
      session.unitLabel ? `Vai para o rateio da unidade ${session.unitLabel}` : 'Vai para o rateio do condomínio',
    );
  }

  return lines.filter((line): line is string => line !== null).join('\n');
}
