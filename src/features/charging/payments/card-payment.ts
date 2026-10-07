import { initPaymentSheet, initStripe, PaymentSheetError, presentPaymentSheet } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

import { env } from '@/config/env';
import { colors, palette } from '@/constants/theme';
import type { PaymentSheetParams } from '@/features/charging/api/charging-api';

export type CardPaymentResult = 'completed' | 'canceled';

export class CardPaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CardPaymentError';
  }
}

function urlScheme() {
  return Constants.appOwnership === 'expo' ? Linking.createURL('/--/') : Linking.createURL('');
}

export async function presentCardPayment(sheet: PaymentSheetParams): Promise<CardPaymentResult> {
  const publishableKey = sheet.publishableKey ?? env.stripePublishableKey;
  if (!publishableKey) throw new CardPaymentError('Pagamento com cartão não configurado neste app.');

  await initStripe({ publishableKey, urlScheme: urlScheme() });

  const init = await initPaymentSheet({
    merchantDisplayName: sheet.merchantDisplayName,
    customerId: sheet.customerId,
    customerEphemeralKeySecret: sheet.customerEphemeralKeySecret,
    paymentIntentClientSecret: sheet.paymentIntentClientSecret,
    returnURL: Linking.createURL('stripe-redirect'),
    style: 'alwaysDark',
    primaryButtonLabel: 'Autorizar e liberar',
    defaultBillingDetails: { address: { country: 'BR' } },
    appearance: {
      colors: {
        primary: colors.accent,
        background: colors.surfaceSheet,
        componentBackground: colors.surfaceInset,
        componentBorder: colors.borderSubtle,
        componentDivider: colors.hairline,
        primaryText: colors.textTitle,
        secondaryText: colors.textMuted,
        componentText: colors.textTitle,
        placeholderText: colors.textDisabled,
        icon: colors.textMuted,
        error: palette.red400,
      },
      shapes: { borderRadius: 12 },
      primaryButton: { shapes: { borderRadius: 16 } },
    },
  });
  if (init.error) throw new CardPaymentError(init.error.localizedMessage ?? init.error.message);

  const result = await presentPaymentSheet();
  if (!result.error) return 'completed';
  if (result.error.code === PaymentSheetError.Canceled) return 'canceled';
  throw new CardPaymentError(result.error.localizedMessage ?? result.error.message);
}
