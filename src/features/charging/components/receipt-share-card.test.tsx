import { render, screen } from '@testing-library/react-native';

import { ReceiptShareCard } from '@/features/charging/components/receipt-share-card';
import { buildClosedSession } from '@/features/charging/testing/session-fixtures';

const NBSP = ' ';

const paymentFixture = {
  paymentIntentId: 'pi_1',
  status: 'CAPTURED' as const,
  currency: 'BRL',
  authorizedCents: 20040,
  capturedCents: 1278,
  failureCode: null,
  authorizedAt: null,
  capturedAt: null,
  canceledAt: null,
};

describe('<ReceiptShareCard />', () => {
  it('renders the branded receipt of a private session', async () => {
    await render(<ReceiptShareCard session={buildClosedSession()} />);

    expect(screen.getByText('EV ChargeOps')).toBeOnTheScreen();
    expect(screen.getByTestId('ring-mark')).toBeOnTheScreen();
    expect(screen.getByText('Recibo de recarga')).toBeOnTheScreen();
    expect(screen.getByText('L1-01 · Vaga 12')).toBeOnTheScreen();
    expect(screen.getByText('Garagem L1')).toBeOnTheScreen();
    expect(screen.getByText(/^07\/10\/2026 às /)).toBeOnTheScreen();
    expect(screen.getByText('12,78')).toBeOnTheScreen();
    expect(screen.getByText(`2,00 kWh × R$${NBSP}0,89/kWh`)).toBeOnTheScreen();
    expect(screen.getByText('Ocupação')).toBeOnTheScreen();
    expect(screen.getByText(`R$${NBSP}11,00`)).toBeOnTheScreen();
    expect(screen.getByText('Rateio da unidade')).toBeOnTheScreen();
    expect(screen.getByText('Unidade B · 42 · fatura mensal')).toBeOnTheScreen();
    expect(screen.getByText('Duração')).toBeOnTheScreen();
    expect(screen.getByText('Potência média')).toBeOnTheScreen();
    expect(screen.getByText('×0,80')).toBeOnTheScreen();
    expect(screen.getByText('Previsão da IA · modelo v1')).toBeOnTheScreen();
    expect(screen.getByText(/^#SESSION-/)).toBeOnTheScreen();
    expect(screen.getByText('evchargeops.com.br')).toBeOnTheScreen();
    expect(screen.getByText('Concluída')).toBeOnTheScreen();
  });

  it('shows what was charged on the card and flags an interrupted session', async () => {
    await render(
      <ReceiptShareCard
        session={buildClosedSession({ status: 'INTERRUPTED', regime: 'COMMERCIAL', payment: paymentFixture })}
      />,
    );

    expect(screen.getByText('Cobrado no cartão')).toBeOnTheScreen();
    expect(screen.getAllByText(`R$${NBSP}12,78`)).toHaveLength(1);
    expect(screen.getByText('Interrompida')).toBeOnTheScreen();
    expect(screen.queryByText('Rateio da unidade')).not.toBeOnTheScreen();
  });
});
