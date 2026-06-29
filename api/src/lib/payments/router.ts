import type { PaymentProvider } from '@prisma/client';
import { createBoldIntent, isBoldAvailable } from './bold-provider.js';
import { createStripeIntent, isStripeAvailable } from './stripe-provider.js';
import type { CreateIntentInput, CreateIntentResult } from './types.js';

export function resolveProvider(
  requested: 'bold' | 'stripe' | 'auto',
  currency: string,
  country?: string,
): PaymentProvider {
  if (requested === 'bold') return 'bold';
  if (requested === 'stripe') return 'stripe';

  if (currency === 'COP' || country === 'CO') {
    return isBoldAvailable() ? 'bold' : 'stripe';
  }
  return isStripeAvailable() ? 'stripe' : 'bold';
}

export async function createProviderIntent(
  provider: PaymentProvider,
  input: CreateIntentInput,
  paymentId: string,
): Promise<CreateIntentResult> {
  if (provider === 'bold') {
    return createBoldIntent(input, paymentId);
  }
  return createStripeIntent(input, paymentId);
}
