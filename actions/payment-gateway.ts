/**
 * File Name: payment-gateway.ts
 * Description: Payment controller architecture. Prepared for future Bold/Alegra integration.
 */

import { createClient } from '../utils/supabase/server';

export async function processManualPayment(bookingId: string, amount: number) {
  const supabase = createClient();

  // 1. Register payment record in database
  const { error: paymentError } = await supabase
    .from('payments')
    .insert([{ booking_id: bookingId, amount, payment_status: 'COMPLETED' }]);

  // 2. Confirm booking status
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({ status: 'CONFIRMED', payment_status: 'PAID' })
    .eq('id', bookingId);

  if (paymentError || bookingError) throw new Error("Transaction record failed.");

  return { success: true };
}
