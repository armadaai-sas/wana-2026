'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

function StripeForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message ?? 'Error en el pago');
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      toast.success('Pago exitoso');
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <PaymentElement />
      <button type="submit" disabled={!stripe || loading} className="wana-btn-primary w-full !rounded-xl">
        {loading ? 'Procesando…' : 'Pagar con tarjeta'}
      </button>
    </form>
  );
}

export default function StripePaymentForm({
  clientSecret,
  publishableKey,
  onSuccess,
}: {
  clientSecret: string;
  publishableKey: string;
  onSuccess: () => void;
}) {
  const stripePromise = loadStripe(publishableKey);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <StripeForm onSuccess={onSuccess} />
    </Elements>
  );
}
