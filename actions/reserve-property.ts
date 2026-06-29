/**
 * File Name: reserve-property.ts
 * Description: Backend action to handle property reservation with atomic availability check.
 */

import { createClient } from '../utils/supabase/server';
import { processManualPayment } from './payment-gateway';

/**
 * Validates availability, creates booking, and processes payment.
 */
export async function reserveProperty(propertyId: string, startDate: Date, endDate: Date, totalAmount: number) {
  const supabase = createClient();
  
  // Development bypass user support
  let userId = '';

  if (process.env.NODE_ENV === 'development' && process.env.TEST_USER_ID) {
    userId = process.env.TEST_USER_ID;
  } else {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');
    userId = user.id;
  }

  // 1. Atomic Availability Check
  const { data: isAvailable, error: checkError } = await supabase
    .rpc('check_availability', { 
      target_property_id: propertyId, 
      check_in: startDate.toISOString(), 
      check_out: endDate.toISOString() 
    });

  if (checkError || !isAvailable) throw new Error("Dates are no longer available.");

  // 2. Create the Booking Record
  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert([{ 
        property_id: propertyId,
        user_id: userId,
        start_date: startDate, 
        end_date: endDate,
        total_amount: totalAmount,
        status: 'PENDING' 
    }])
    .select()
    .single();

  if (insertError) throw new Error("Failed to create booking.");

  // 3. Trigger Payment Process
  const paymentResult = await processManualPayment(booking.id, totalAmount);

  return { success: true, bookingId: booking.id, payment: paymentResult };
}
