import type { CreateIntentInput, CreateIntentResult, ProviderSyncResult } from './types.js';

const BOLD_BASE = 'https://integrations.api.bold.co';

function boldConfigured(): boolean {
  return Boolean(process.env.BOLD_API_KEY);
}

export function isBoldAvailable(): boolean {
  return boldConfigured() || process.env.PAYMENTS_MODE === 'mock';
}

export async function createBoldIntent(
  input: CreateIntentInput,
  paymentId: string,
): Promise<CreateIntentResult> {
  if (!boldConfigured()) {
    if (process.env.PAYMENTS_MODE === 'mock' || process.env.NODE_ENV === 'development') {
      return {
        paymentId,
        provider: 'bold',
        mode: 'mock',
        checkoutUrl: `${input.returnUrl}?mock=1&payment_id=${paymentId}`,
      };
    }
    throw new Error('Bold no configurado. Define BOLD_API_KEY.');
  }

  const apiKey = process.env.BOLD_API_KEY!;
  const totalAmount = Math.round(input.amount);

  const body = {
    amount_type: 'CLOSE',
    amount: {
      total_amount: totalAmount,
      currency: 'COP',
    },
    description: input.description.slice(0, 200),
    reference: input.idempotencyKey,
  };

  const res = await fetch(`${BOLD_BASE}/online/link/v1`, {
    method: 'POST',
    headers: {
      Authorization: `x-api-key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    payload?: { payment_link?: string; url?: string };
    errors?: Array<{ message?: string }>;
  };

  if (!res.ok || !data.payload?.url) {
    const msg = data.errors?.[0]?.message ?? `Bold API error ${res.status}`;
    throw new Error(msg);
  }

  return {
    paymentId,
    provider: 'bold',
    mode: 'live',
    checkoutUrl: data.payload.url,
    externalId: data.payload.payment_link,
  };
}

export async function syncBoldPayment(externalId: string): Promise<ProviderSyncResult> {
  if (!boldConfigured()) {
    return { paid: false };
  }

  const apiKey = process.env.BOLD_API_KEY!;
  const res = await fetch(`${BOLD_BASE}/online/link/v1/${externalId}`, {
    headers: { Authorization: `x-api-key ${apiKey}` },
  });

  if (!res.ok) {
    return { paid: false };
  }

  const data = (await res.json()) as { status?: string; transaction_id?: string };
  const paid = data.status === 'PAID';

  return {
    paid,
    externalId: data.transaction_id ?? externalId,
    raw: data,
  };
}

export function verifyBoldWebhook(payload: unknown, signature: string | undefined): boolean {
  const secret = process.env.BOLD_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV === 'development';
  if (!signature) return false;
  return signature === secret || signature === `Bearer ${secret}`;
}

export function parseBoldWebhook(payload: Record<string, unknown>): {
  reference?: string;
  paymentLink?: string;
  status?: string;
  transactionId?: string;
} {
  return {
    reference: payload.reference as string | undefined,
    paymentLink: (payload.id ?? payload.payment_link) as string | undefined,
    status: payload.status as string | undefined,
    transactionId: payload.transaction_id as string | undefined,
  };
}
