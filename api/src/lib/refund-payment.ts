import type { Payment } from '@prisma/client';
import Stripe from 'stripe';
import { prisma } from './prisma.js';

export type RefundResult =
  | { status: 'refunded'; provider_refund_id?: string }
  | { status: 'pending_manual'; reason: string }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string };

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function issuePaymentRefund(
  payment: Payment,
  refundAmount: number,
): Promise<RefundResult> {
  if (refundAmount <= 0) {
    return { status: 'skipped', reason: 'No refund amount due' };
  }

  if (payment.status !== 'succeeded') {
    return { status: 'skipped', reason: 'Payment was not succeeded' };
  }

  if (process.env.PAYMENTS_MODE === 'mock' || payment.externalId?.startsWith('mock_')) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'refunded',
        metadata: {
          ...(typeof payment.metadata === 'object' && payment.metadata ? payment.metadata : {}),
          refund_amount: refundAmount,
          refunded_at: new Date().toISOString(),
          mode: 'mock',
        },
      },
    });
    return { status: 'refunded', provider_refund_id: `mock_refund_${payment.id}` };
  }

  if (payment.provider === 'stripe' && payment.externalId) {
    const stripe = getStripe();
    if (!stripe) {
      return { status: 'pending_manual', reason: 'Stripe not configured — ops must refund manually' };
    }
    try {
      const amountCents = Math.min(
        Math.round(refundAmount * 100),
        Math.round(Number(payment.amount) * 100),
      );
      const refund = await stripe.refunds.create({
        payment_intent: payment.externalId,
        amount: amountCents,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'refunded',
          metadata: {
            ...(typeof payment.metadata === 'object' && payment.metadata ? payment.metadata : {}),
            refund_amount: refundAmount,
            stripe_refund_id: refund.id,
            refunded_at: new Date().toISOString(),
          },
        },
      });
      return { status: 'refunded', provider_refund_id: refund.id };
    } catch (err) {
      return {
        status: 'failed',
        reason: err instanceof Error ? err.message : 'Stripe refund failed',
      };
    }
  }

  if (payment.provider === 'bold') {
    return {
      status: 'pending_manual',
      reason: 'Bold refund must be processed manually in dashboard.bold.co',
    };
  }

  return { status: 'pending_manual', reason: 'Unknown payment provider' };
}
