/**
 * File Name: use-booking-flow.ts
 * Description: Manages the state and communication between UI and Backend (reserveProperty).
 */

import { useState } from 'react';
import { reserveProperty } from '@/actions/reserve-property';

export function useBookingFlow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleBooking = async (propertyId: string, startDate: Date, endDate: Date, totalAmount: number) => {
    setLoading(true);
    setError(null);

    try {
      // Direct call to the backend action we created
      const result = await reserveProperty(propertyId, startDate, endDate, totalAmount);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { handleBooking, loading, error };
}
