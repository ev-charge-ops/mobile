import type { PaymentSheetParams } from '@/features/charging/api/charging-api';

export type CardPaymentResult = 'completed' | 'canceled';

export class CardPaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CardPaymentError';
  }
}

export async function presentCardPayment(_sheet: PaymentSheetParams): Promise<CardPaymentResult> {
  throw new CardPaymentError('O pagamento com cartão está disponível apenas no app para celular.');
}
