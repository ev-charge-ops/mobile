import { buildReceiptShareText } from '@/features/charging/receipt-share';
import { buildClosedSession } from '@/features/charging/testing/session-fixtures';

const NBSP = ' ';

describe('buildReceiptShareText', () => {
  it('summarizes a closed private session in pt-BR', () => {
    const text = buildReceiptShareText(buildClosedSession());

    expect(text).toContain('Recibo EV ChargeOps #SESSION-');
    expect(text).toContain('Garagem L1 · Vaga 12 (L1-01)');
    expect(text).toContain('07/10/2026');
    expect(text).toContain(`Energia: 2,00 kWh · R$${NBSP}1,78`);
    expect(text).toContain(`Tarifa travada: R$${NBSP}0,89/kWh`);
    expect(text).toContain(`Taxa de ocupação: R$${NBSP}11,00 (44 min)`);
    expect(text).toContain(`Total: R$${NBSP}12,78`);
    expect(text).toContain('Vai para o rateio da unidade B · 42');
    expect(text).not.toContain('interrompida');
  });

  it('mentions the captured card amount and interruptions', () => {
    const text = buildReceiptShareText(
      buildClosedSession({
        status: 'INTERRUPTED',
        regime: 'COMMERCIAL',
        idleFeeCents: 0,
        payment: {
          paymentIntentId: 'pi_1',
          status: 'CAPTURED',
          currency: 'BRL',
          authorizedCents: 20040,
          capturedCents: 178,
          failureCode: null,
          authorizedAt: null,
          capturedAt: null,
          canceledAt: null,
          mode: 'TEST',
          refundedCents: null,
          refundedAt: null,
        },
      }),
    );

    expect(text).toContain('Recarga interrompida');
    expect(text).toContain('Taxa de ocupação: sem cobrança');
    expect(text).toContain(`Cobrado no cartão: R$${NBSP}1,78`);
    expect(text).not.toContain('rateio');
  });
});
