'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { DayPicker, DateRange } from 'react-day-picker';
import { useBookingFlow } from '@/hooks/use-booking-flow';
import 'react-day-picker/dist/style.css';

export const DateRangePicker = ({ propertyId, totalAmount }: { propertyId: string; totalAmount: number }) => {
  const [range, setRange] = useState<DateRange | undefined>();
  const { handleBooking, loading } = useBookingFlow();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      className="bg-glass-bg border border-glass-border backdrop-blur-md shadow-glass rounded-xl p-6"
    >
      <div className="mb-6 text-white text-lg font-semibold">Selecciona tu estancia</div>
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        className="rounded-[32px] bg-white/5 p-4 text-white"
      />
      <button
        onClick={() => range?.from && range?.to && handleBooking(propertyId, range.from, range.to, totalAmount)}
        disabled={loading || !range?.from || !range?.to}
        className="w-full mt-6 py-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl border border-white/10 disabled:opacity-50"
      >
        {loading ? 'Procesando...' : 'Confirmar Reserva'}
      </button>
    </motion.section>
  );
};
