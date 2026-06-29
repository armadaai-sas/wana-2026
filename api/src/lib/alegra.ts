import type { WanaFees } from './fees.js';

export interface AlegraClient {
  headers: Record<string, string>;
  baseUrl: string;
}

export function getAlegraClient(): AlegraClient | null {
  const email = process.env.ALEGRA_EMAIL;
  const token = process.env.ALEGRA_API_TOKEN;

  if (!email || !token) {
    return null;
  }

  const auth = Buffer.from(`${email}:${token}`).toString('base64');

  return {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    baseUrl: 'https://api.alegra.com/api/v1',
  };
}

export function buildAlegraInvoicePayload(params: {
  guestName: string;
  guestEmail: string;
  propertyTitle: string;
  nights: number;
  fees: WanaFees;
  transactionId: string;
}) {
  const { guestName, guestEmail, propertyTitle, nights, fees, transactionId } = params;
  const pricePerNight = nights > 0 ? fees.subtotal / nights : fees.subtotal;
  const taxPerNight = nights > 0 ? (fees.inc_tax + fees.parafiscal_tax) / nights : 0;

  return {
    client: {
      name: guestName,
      email: guestEmail,
    },
    items: [
      {
        description: `Hospedaje — ${propertyTitle} (${nights} noches)`,
        quantity: nights > 0 ? nights : 1,
        price: pricePerNight,
        tax: taxPerNight,
      },
    ],
    currency: 'COP',
    observations: `Waná reserva · Ref: ${transactionId}`,
  };
}

export async function createAlegraInvoice(payload: object): Promise<{ id: string }> {
  const client = getAlegraClient();
  if (!client) {
    throw new Error('ALEGRA_NOT_CONFIGURED');
  }

  const response = await fetch(`${client.baseUrl}/invoices`, {
    method: 'POST',
    headers: client.headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Alegra API ${response.status}: ${body}`);
  }

  return response.json() as Promise<{ id: string }>;
}
